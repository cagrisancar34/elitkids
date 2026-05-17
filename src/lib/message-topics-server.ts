import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { MessageChannel, MessageTopic, MessageTopicKey } from "@/lib/types";
import {
  DEFAULT_MESSAGE_TOPICS,
  renderMessageTemplate,
  toMessageTopicRecord,
} from "@/lib/message-topics";

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function ensureMessageTopics(organizationId: string) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const now = new Date().toISOString();
  await adminClient.from("message_topics").upsert(
    DEFAULT_MESSAGE_TOPICS.map((topic) => ({
      organization_id: organizationId,
      topic_key: topic.topicKey,
      title: topic.title,
      description: topic.description,
      channel: topic.channel,
      body_template: topic.bodyTemplate,
      available_variables_json: topic.availableVariables,
      active: topic.active,
      editable_by_manager: topic.editableByManager,
      updated_at: now,
    })),
    { onConflict: "organization_id,topic_key" },
  );
}

export async function getMessageTopicsForOrganization(
  organizationId: string,
  options?: { editableForManagerOnly?: boolean },
) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as MessageTopic[];
  }

  await ensureMessageTopics(organizationId);

  let query = adminClient
    .from("message_topics")
    .select(
      "id, topic_key, title, description, channel, body_template, available_variables_json, active, editable_by_manager",
    )
    .eq("organization_id", organizationId)
    .order("topic_key");

  if (options?.editableForManagerOnly) {
    query = query.eq("editable_by_manager", true);
  }

  const { data } = await query;

  return (data ?? []).map((topic) => ({
    id: topic.id,
    topicKey: topic.topic_key as MessageTopicKey,
    title: topic.title ?? "",
    description: topic.description ?? "",
    channel: (topic.channel ?? "whatsapp") as MessageChannel,
    bodyTemplate: topic.body_template ?? "",
    availableVariables: toStringArray(topic.available_variables_json),
    active: Boolean(topic.active),
    editableByManager: Boolean(topic.editable_by_manager),
  })) satisfies MessageTopic[];
}

export async function getMessageTopicByKey(organizationId: string, topicKey: MessageTopicKey) {
  const topics = await getMessageTopicsForOrganization(organizationId);
  return topics.find((topic) => topic.topicKey === topicKey) ?? null;
}

export async function updateMessageTopicForOrganization(input: {
  organizationId: string;
  topicId: string;
  title: string;
  description: string;
  channel: MessageChannel;
  bodyTemplate: string;
  active: boolean;
}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    throw new Error("Supabase admin baglantisi kurulamadi.");
  }

  const { error } = await adminClient
    .from("message_topics")
    .update({
      title: input.title,
      description: input.description,
      channel: input.channel,
      body_template: input.bodyTemplate,
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", input.organizationId)
    .eq("id", input.topicId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function renderMessageTopicForOrganization(input: {
  organizationId: string;
  topicKey: MessageTopicKey;
  variables: Record<string, string | number | null | undefined>;
}) {
  const topic =
    (await getMessageTopicByKey(input.organizationId, input.topicKey)) ??
    toMessageTopicRecord(DEFAULT_MESSAGE_TOPICS.find((item) => item.topicKey === input.topicKey)!);

  return {
    topic,
    title: renderMessageTemplate(topic.title, input.variables),
    body: renderMessageTemplate(topic.bodyTemplate, input.variables),
  };
}

export async function createRoleScopedTopicNotifications(input: {
  organizationId: string;
  topicKey: MessageTopicKey;
  variables: Record<string, string | number | null | undefined>;
  roles?: Array<"admin" | "manager" | "coach" | "parent">;
  channelKey: string;
}) {
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return;
  }

  const roles = input.roles ?? ["admin", "manager"];
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, user_roles(role)")
    .eq("organization_id", input.organizationId);

  const targetProfileIds = (profiles ?? [])
    .filter((profile) =>
      Array.isArray(profile.user_roles)
        ? profile.user_roles.some((role) => roles.includes(role.role))
        : false,
    )
    .map((profile) => profile.id);

  if (!targetProfileIds.length) {
    return;
  }

  const { data: existingNotifications } = await adminClient
    .from("notifications")
    .select("id, profile_id")
    .eq("channel", input.channelKey)
    .in("profile_id", targetProfileIds);

  const existingProfileIds = new Set((existingNotifications ?? []).map((item) => item.profile_id));
  const missingProfileIds = targetProfileIds.filter((profileId) => !existingProfileIds.has(profileId));

  if (!missingProfileIds.length) {
    return;
  }

  const rendered = await renderMessageTopicForOrganization({
    organizationId: input.organizationId,
    topicKey: input.topicKey,
    variables: input.variables,
  });

  if (!rendered.topic.active) {
    return;
  }

  await adminClient.from("notifications").insert(
    missingProfileIds.map((profileId) => ({
      profile_id: profileId,
      title: rendered.title,
      body: rendered.body,
      channel: input.channelKey,
    })),
  );
}
