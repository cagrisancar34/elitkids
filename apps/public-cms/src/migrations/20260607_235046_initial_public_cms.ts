import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public_cms"."enum_headlines_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum_headlines_link_type" AS ENUM('program', 'custom', 'none');
  CREATE TYPE "public_cms"."enum_headlines_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum__headlines_v_version_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum__headlines_v_version_link_type" AS ENUM('program', 'custom', 'none');
  CREATE TYPE "public_cms"."enum__headlines_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum_programs_dates_capacity_status" AS ENUM('available', 'limited', 'full');
  CREATE TYPE "public_cms"."enum_programs_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum_programs_availability_status" AS ENUM('open', 'soon', 'full', 'draft');
  CREATE TYPE "public_cms"."enum_programs_region" AS ENUM('domestic', 'international');
  CREATE TYPE "public_cms"."enum_programs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum__programs_v_version_dates_capacity_status" AS ENUM('available', 'limited', 'full');
  CREATE TYPE "public_cms"."enum__programs_v_version_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum__programs_v_version_availability_status" AS ENUM('open', 'soon', 'full', 'draft');
  CREATE TYPE "public_cms"."enum__programs_v_version_region" AS ENUM('domestic', 'international');
  CREATE TYPE "public_cms"."enum__programs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum_galleries_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum_galleries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum__galleries_v_version_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum__galleries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum_applications_status" AS ENUM('new', 'contacted', 'follow-up', 'closed');
  CREATE TYPE "public_cms"."enum_applications_legacy_sync_status" AS ENUM('pending', 'synced', 'failed');
  CREATE TYPE "public_cms"."enum_categories_type" AS ENUM('travel', 'workshop', 'camp', 'international', 'seasonal');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_rich_content_width" AS ENUM('narrow', 'wide');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_media_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_feature_list_items_icon" AS ENUM('leaf', 'shield', 'heart', 'bike', 'brush', 'mountain', 'plane', 'sparkles');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_feature_list_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_call_to_action_tone" AS ENUM('green', 'light');
  CREATE TYPE "public_cms"."enum_site_pages_blocks_gallery_display" AS ENUM('grid', 'strip');
  CREATE TYPE "public_cms"."enum_site_pages_home_metrics_icon" AS ENUM('leaf', 'users', 'calendar', 'shield', 'sparkles', 'location');
  CREATE TYPE "public_cms"."enum_site_pages_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum_site_pages_page_type" AS ENUM('home', 'landing', 'custom', 'system');
  CREATE TYPE "public_cms"."enum_site_pages_hero_style" AS ENUM('simple', 'image');
  CREATE TYPE "public_cms"."enum_site_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_rich_content_width" AS ENUM('narrow', 'wide');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_media_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_feature_list_items_icon" AS ENUM('leaf', 'shield', 'heart', 'bike', 'brush', 'mountain', 'plane', 'sparkles');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_feature_list_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_call_to_action_tone" AS ENUM('green', 'light');
  CREATE TYPE "public_cms"."enum__site_pages_v_blocks_gallery_display" AS ENUM('grid', 'strip');
  CREATE TYPE "public_cms"."enum__site_pages_v_version_home_metrics_icon" AS ENUM('leaf', 'users', 'calendar', 'shield', 'sparkles', 'location');
  CREATE TYPE "public_cms"."enum__site_pages_v_version_workflow_status" AS ENUM('draft', 'review');
  CREATE TYPE "public_cms"."enum__site_pages_v_version_page_type" AS ENUM('home', 'landing', 'custom', 'system');
  CREATE TYPE "public_cms"."enum__site_pages_v_version_hero_style" AS ENUM('simple', 'image');
  CREATE TYPE "public_cms"."enum__site_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum_users_role" AS ENUM('admin', 'editor', 'form-tracker');
  CREATE TYPE "public_cms"."enum_home_page_overlay_strength" AS ENUM('light', 'medium', 'dark');
  CREATE TYPE "public_cms"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public_cms"."enum__home_page_v_version_overlay_strength" AS ENUM('light', 'medium', 'dark');
  CREATE TYPE "public_cms"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "public_cms"."headlines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_status" "public_cms"."enum_headlines_workflow_status" DEFAULT 'draft',
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"kicker" varchar DEFAULT 'Öne çıkan',
  	"summary" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"external_image" varchar,
  	"image_alt" varchar,
  	"link_type" "public_cms"."enum_headlines_link_type" DEFAULT 'program',
  	"program_id" integer,
  	"custom_url" varchar,
  	"button_label" varchar DEFAULT 'Detayları incele',
  	"is_active" boolean DEFAULT true,
  	"order" numeric DEFAULT 1,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "public_cms"."enum_headlines_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "public_cms"."_headlines_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow_status" "public_cms"."enum__headlines_v_version_workflow_status" DEFAULT 'draft',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_kicker" varchar DEFAULT 'Öne çıkan',
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_image_id" integer,
  	"version_external_image" varchar,
  	"version_image_alt" varchar,
  	"version_link_type" "public_cms"."enum__headlines_v_version_link_type" DEFAULT 'program',
  	"version_program_id" integer,
  	"version_custom_url" varchar,
  	"version_button_label" varchar DEFAULT 'Detayları incele',
  	"version_is_active" boolean DEFAULT true,
  	"version_order" numeric DEFAULT 1,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "public_cms"."enum__headlines_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "public_cms"."programs_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"capacity_status" "public_cms"."enum_programs_dates_capacity_status" DEFAULT 'available'
  );
  
  CREATE TABLE "public_cms"."programs_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "public_cms"."programs_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "public_cms"."programs_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "public_cms"."programs_excluded" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "public_cms"."programs_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "public_cms"."programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_status" "public_cms"."enum_programs_workflow_status" DEFAULT 'draft',
  	"title" varchar,
  	"slug" varchar,
  	"availability_status" "public_cms"."enum_programs_availability_status" DEFAULT 'open',
  	"summary" varchar,
  	"category_id" integer,
  	"location_id" integer,
  	"region" "public_cms"."enum_programs_region" DEFAULT 'domestic',
  	"audience" varchar,
  	"season" varchar,
  	"featured" boolean DEFAULT false,
  	"price_show_price" boolean DEFAULT false,
  	"price_label" varchar DEFAULT 'Bilgi almak için iletişime geçin',
  	"price_amount" numeric,
  	"cover_id" integer,
  	"external_cover" varchar,
  	"cover_alt" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "public_cms"."enum_programs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"capacity_status" "public_cms"."enum__programs_v_version_dates_capacity_status" DEFAULT 'available',
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_excluded" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_programs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow_status" "public_cms"."enum__programs_v_version_workflow_status" DEFAULT 'draft',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_availability_status" "public_cms"."enum__programs_v_version_availability_status" DEFAULT 'open',
  	"version_summary" varchar,
  	"version_category_id" integer,
  	"version_location_id" integer,
  	"version_region" "public_cms"."enum__programs_v_version_region" DEFAULT 'domestic',
  	"version_audience" varchar,
  	"version_season" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_price_show_price" boolean DEFAULT false,
  	"version_price_label" varchar DEFAULT 'Bilgi almak için iletişime geçin',
  	"version_price_amount" numeric,
  	"version_cover_id" integer,
  	"version_external_cover" varchar,
  	"version_cover_alt" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "public_cms"."enum__programs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "public_cms"."galleries_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"external_image" varchar,
  	"alt" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "public_cms"."galleries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_status" "public_cms"."enum_galleries_workflow_status" DEFAULT 'draft',
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"cover_id" integer,
  	"external_cover" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "public_cms"."enum_galleries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "public_cms"."_galleries_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"external_image" varchar,
  	"alt" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_galleries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow_status" "public_cms"."enum__galleries_v_version_workflow_status" DEFAULT 'draft',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_external_cover" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "public_cms"."enum__galleries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "public_cms"."applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"child_age" varchar,
  	"program_id" integer,
  	"program_title" varchar,
  	"message" varchar,
  	"kvkk_consent" boolean DEFAULT false NOT NULL,
  	"status" "public_cms"."enum_applications_status" DEFAULT 'new' NOT NULL,
  	"notes" varchar,
  	"legacy_sync_status" "public_cms"."enum_applications_legacy_sync_status" DEFAULT 'pending' NOT NULL,
  	"legacy_synced_at" timestamp(3) with time zone,
  	"legacy_sync_message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "public_cms"."enum_categories_type" DEFAULT 'travel' NOT NULL,
  	"description" varchar,
  	"is_featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"country" varchar DEFAULT 'Türkiye' NOT NULL,
  	"summary" varchar,
  	"cover_id" integer,
  	"external_cover" varchar,
  	"map_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_rich_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"width" "public_cms"."enum_site_pages_blocks_rich_content_width" DEFAULT 'narrow',
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"external_image" varchar,
  	"image_alt" varchar,
  	"image_position" "public_cms"."enum_site_pages_blocks_media_text_image_position" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "public_cms"."enum_site_pages_blocks_feature_list_items_icon" DEFAULT 'leaf',
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"columns" "public_cms"."enum_site_pages_blocks_feature_list_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"tone" "public_cms"."enum_site_pages_blocks_call_to_action_tone" DEFAULT 'green',
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'İletişim',
  	"title" varchar DEFAULT 'Programlar hakkında bilgi alın',
  	"body" varchar,
  	"show_contact_details" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"gallery_id" integer,
  	"display" "public_cms"."enum_site_pages_blocks_gallery_display" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_location_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_program_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_testimonial_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_partner_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_blocks_headline_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_home_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "public_cms"."enum_site_pages_home_metrics_icon" DEFAULT 'leaf',
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages_home_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "public_cms"."site_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workflow_status" "public_cms"."enum_site_pages_workflow_status" DEFAULT 'draft',
  	"page_type" "public_cms"."enum_site_pages_page_type" DEFAULT 'custom',
  	"title" varchar,
  	"slug" varchar,
  	"system_path" varchar,
  	"hero_style" "public_cms"."enum_site_pages_hero_style" DEFAULT 'simple',
  	"hero_eyebrow" varchar,
  	"hero_heading" varchar,
  	"hero_summary" varchar,
  	"hero_image_id" integer,
  	"hero_external_image" varchar,
  	"hero_image_alt" varchar,
  	"home_process_eyebrow" varchar DEFAULT 'Nasıl çalışır?',
  	"home_process_title" varchar DEFAULT 'Yönetilebilir, sade ve güven veren başvuru akışı',
  	"home_process_description" varchar DEFAULT 'Ekip CMS panelinden programları, tarihleri, lokasyonları, yorumları ve başvuruları tek yerden yönetir.',
  	"partner_eyebrow" varchar DEFAULT 'Katkılarıyla',
  	"navigation_label" varchar,
  	"show_in_header" boolean DEFAULT false,
  	"header_order" numeric DEFAULT 10,
  	"show_in_footer" boolean DEFAULT false,
  	"footer_order" numeric DEFAULT 10,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_canonical_url" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "public_cms"."enum_site_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_rich_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"width" "public_cms"."enum__site_pages_v_blocks_rich_content_width" DEFAULT 'narrow',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"external_image" varchar,
  	"image_alt" varchar,
  	"image_position" "public_cms"."enum__site_pages_v_blocks_media_text_image_position" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_feature_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "public_cms"."enum__site_pages_v_blocks_feature_list_items_icon" DEFAULT 'leaf',
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_feature_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"columns" "public_cms"."enum__site_pages_v_blocks_feature_list_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" varchar,
  	"button_label" varchar,
  	"button_url" varchar,
  	"tone" "public_cms"."enum__site_pages_v_blocks_call_to_action_tone" DEFAULT 'green',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'İletişim',
  	"title" varchar DEFAULT 'Programlar hakkında bilgi alın',
  	"body" varchar,
  	"show_contact_details" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"gallery_id" integer,
  	"display" "public_cms"."enum__site_pages_v_blocks_gallery_display" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_location_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_program_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_testimonial_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_partner_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_blocks_headline_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_version_home_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "public_cms"."enum__site_pages_v_version_home_metrics_icon" DEFAULT 'leaf',
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v_version_home_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "public_cms"."_site_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_workflow_status" "public_cms"."enum__site_pages_v_version_workflow_status" DEFAULT 'draft',
  	"version_page_type" "public_cms"."enum__site_pages_v_version_page_type" DEFAULT 'custom',
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_system_path" varchar,
  	"version_hero_style" "public_cms"."enum__site_pages_v_version_hero_style" DEFAULT 'simple',
  	"version_hero_eyebrow" varchar,
  	"version_hero_heading" varchar,
  	"version_hero_summary" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_external_image" varchar,
  	"version_hero_image_alt" varchar,
  	"version_home_process_eyebrow" varchar DEFAULT 'Nasıl çalışır?',
  	"version_home_process_title" varchar DEFAULT 'Yönetilebilir, sade ve güven veren başvuru akışı',
  	"version_home_process_description" varchar DEFAULT 'Ekip CMS panelinden programları, tarihleri, lokasyonları, yorumları ve başvuruları tek yerden yönetir.',
  	"version_partner_eyebrow" varchar DEFAULT 'Katkılarıyla',
  	"version_navigation_label" varchar,
  	"version_show_in_header" boolean DEFAULT false,
  	"version_header_order" numeric DEFAULT 10,
  	"version_show_in_footer" boolean DEFAULT false,
  	"version_footer_order" numeric DEFAULT 10,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_canonical_url" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "public_cms"."enum__site_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "public_cms"."testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"parent_name" varchar NOT NULL,
  	"child_info" varchar,
  	"program_name" varchar,
  	"is_featured" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"logo_id" integer,
  	"url" varchar,
  	"order" numeric DEFAULT 10 NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "public_cms"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "public_cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "public_cms"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "public_cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "public_cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"headlines_id" integer,
  	"programs_id" integer,
  	"galleries_id" integer,
  	"applications_id" integer,
  	"categories_id" integer,
  	"locations_id" integer,
  	"site_pages_id" integer,
  	"testimonials_id" integer,
  	"partners_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "public_cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "public_cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "public_cms"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_brand" varchar DEFAULT 'Dört Mevsim Doğada' NOT NULL,
  	"footer_headline" varchar DEFAULT 'Çocuklu aileler için güvenli, canlı ve doğaya yakın programlar.' NOT NULL,
  	"copyright_text" varchar DEFAULT 'Tüm hakları saklıdır. Bu demo satış ve ödeme akışı içermez.' NOT NULL,
  	"address" varchar DEFAULT 'Erenköy Mah. Çamlıköşk Sk. No:3A Kadıköy/İstanbul' NOT NULL,
  	"phone" varchar DEFAULT '+90 555 111 22 33' NOT NULL,
  	"whatsapp_number" varchar DEFAULT '905551112233' NOT NULL,
  	"email" varchar DEFAULT 'merhaba@dortmevsimdogada.com' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "public_cms"."home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Doğa, spor ve sanat odaklı aile programları',
  	"title" varchar DEFAULT 'Dört Mevsim Doğada',
  	"description" varchar DEFAULT 'Çocukların merakını, ailelerin güven ihtiyacını ve doğanın iyi gelen ritmini aynı programda buluşturan modern etkinlik platformu.',
  	"background_image_id" integer,
  	"background_alt" varchar DEFAULT 'Doğada aileler için keşif rotası',
  	"overlay_strength" "public_cms"."enum_home_page_overlay_strength" DEFAULT 'medium',
  	"primary_button_enabled" boolean DEFAULT true,
  	"primary_button_label" varchar DEFAULT 'Programları keşfet',
  	"primary_button_url" varchar DEFAULT '/programlar',
  	"secondary_button_enabled" boolean DEFAULT true,
  	"secondary_button_label" varchar DEFAULT 'Bilgi al',
  	"secondary_button_url" varchar DEFAULT '/iletisim',
  	"_status" "public_cms"."enum_home_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "public_cms"."_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_eyebrow" varchar DEFAULT 'Doğa, spor ve sanat odaklı aile programları',
  	"version_title" varchar DEFAULT 'Dört Mevsim Doğada',
  	"version_description" varchar DEFAULT 'Çocukların merakını, ailelerin güven ihtiyacını ve doğanın iyi gelen ritmini aynı programda buluşturan modern etkinlik platformu.',
  	"version_background_image_id" integer,
  	"version_background_alt" varchar DEFAULT 'Doğada aileler için keşif rotası',
  	"version_overlay_strength" "public_cms"."enum__home_page_v_version_overlay_strength" DEFAULT 'medium',
  	"version_primary_button_enabled" boolean DEFAULT true,
  	"version_primary_button_label" varchar DEFAULT 'Programları keşfet',
  	"version_primary_button_url" varchar DEFAULT '/programlar',
  	"version_secondary_button_enabled" boolean DEFAULT true,
  	"version_secondary_button_label" varchar DEFAULT 'Bilgi al',
  	"version_secondary_button_url" varchar DEFAULT '/iletisim',
  	"version__status" "public_cms"."enum__home_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "public_cms"."headlines" ADD CONSTRAINT "headlines_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."headlines" ADD CONSTRAINT "headlines_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public_cms"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."headlines" ADD CONSTRAINT "headlines_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_headlines_v" ADD CONSTRAINT "_headlines_v_parent_id_headlines_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."headlines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_headlines_v" ADD CONSTRAINT "_headlines_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_headlines_v" ADD CONSTRAINT "_headlines_v_version_program_id_programs_id_fk" FOREIGN KEY ("version_program_id") REFERENCES "public_cms"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_headlines_v" ADD CONSTRAINT "_headlines_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_dates" ADD CONSTRAINT "programs_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_gallery" ADD CONSTRAINT "programs_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_gallery" ADD CONSTRAINT "programs_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_details" ADD CONSTRAINT "programs_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_included" ADD CONSTRAINT "programs_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_excluded" ADD CONSTRAINT "programs_excluded_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs_faq" ADD CONSTRAINT "programs_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."programs" ADD CONSTRAINT "programs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public_cms"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."programs" ADD CONSTRAINT "programs_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public_cms"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."programs" ADD CONSTRAINT "programs_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."programs" ADD CONSTRAINT "programs_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_dates" ADD CONSTRAINT "_programs_v_version_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_gallery" ADD CONSTRAINT "_programs_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_gallery" ADD CONSTRAINT "_programs_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_details" ADD CONSTRAINT "_programs_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_included" ADD CONSTRAINT "_programs_v_version_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_excluded" ADD CONSTRAINT "_programs_v_version_excluded_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v_version_faq" ADD CONSTRAINT "_programs_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v" ADD CONSTRAINT "_programs_v_parent_id_programs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v" ADD CONSTRAINT "_programs_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public_cms"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v" ADD CONSTRAINT "_programs_v_version_location_id_locations_id_fk" FOREIGN KEY ("version_location_id") REFERENCES "public_cms"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v" ADD CONSTRAINT "_programs_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_programs_v" ADD CONSTRAINT "_programs_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."galleries_images" ADD CONSTRAINT "galleries_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."galleries_images" ADD CONSTRAINT "galleries_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."galleries" ADD CONSTRAINT "galleries_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."galleries" ADD CONSTRAINT "galleries_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_galleries_v_version_images" ADD CONSTRAINT "_galleries_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_galleries_v_version_images" ADD CONSTRAINT "_galleries_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_galleries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_galleries_v" ADD CONSTRAINT "_galleries_v_parent_id_galleries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_galleries_v" ADD CONSTRAINT "_galleries_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_galleries_v" ADD CONSTRAINT "_galleries_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."applications" ADD CONSTRAINT "applications_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public_cms"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."locations" ADD CONSTRAINT "locations_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_rich_content" ADD CONSTRAINT "site_pages_blocks_rich_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_media_text" ADD CONSTRAINT "site_pages_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_media_text" ADD CONSTRAINT "site_pages_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_feature_list_items" ADD CONSTRAINT "site_pages_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_feature_list" ADD CONSTRAINT "site_pages_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_call_to_action" ADD CONSTRAINT "site_pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_contact_form" ADD CONSTRAINT "site_pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_gallery" ADD CONSTRAINT "site_pages_blocks_gallery_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public_cms"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_gallery" ADD CONSTRAINT "site_pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_location_grid" ADD CONSTRAINT "site_pages_blocks_location_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_program_grid" ADD CONSTRAINT "site_pages_blocks_program_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_testimonial_grid" ADD CONSTRAINT "site_pages_blocks_testimonial_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_partner_grid" ADD CONSTRAINT "site_pages_blocks_partner_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_blocks_headline_grid" ADD CONSTRAINT "site_pages_blocks_headline_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_home_metrics" ADD CONSTRAINT "site_pages_home_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages_home_process_steps" ADD CONSTRAINT "site_pages_home_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages" ADD CONSTRAINT "site_pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."site_pages" ADD CONSTRAINT "site_pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_rich_content" ADD CONSTRAINT "_site_pages_v_blocks_rich_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_media_text" ADD CONSTRAINT "_site_pages_v_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_media_text" ADD CONSTRAINT "_site_pages_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_feature_list_items" ADD CONSTRAINT "_site_pages_v_blocks_feature_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v_blocks_feature_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_feature_list" ADD CONSTRAINT "_site_pages_v_blocks_feature_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_call_to_action" ADD CONSTRAINT "_site_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_contact_form" ADD CONSTRAINT "_site_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_gallery" ADD CONSTRAINT "_site_pages_v_blocks_gallery_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public_cms"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_gallery" ADD CONSTRAINT "_site_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_location_grid" ADD CONSTRAINT "_site_pages_v_blocks_location_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_program_grid" ADD CONSTRAINT "_site_pages_v_blocks_program_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_testimonial_grid" ADD CONSTRAINT "_site_pages_v_blocks_testimonial_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_partner_grid" ADD CONSTRAINT "_site_pages_v_blocks_partner_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_blocks_headline_grid" ADD CONSTRAINT "_site_pages_v_blocks_headline_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_version_home_metrics" ADD CONSTRAINT "_site_pages_v_version_home_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v_version_home_process_steps" ADD CONSTRAINT "_site_pages_v_version_home_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."_site_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v" ADD CONSTRAINT "_site_pages_v_parent_id_site_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v" ADD CONSTRAINT "_site_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_site_pages_v" ADD CONSTRAINT "_site_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_headlines_fk" FOREIGN KEY ("headlines_id") REFERENCES "public_cms"."headlines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public_cms"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_galleries_fk" FOREIGN KEY ("galleries_id") REFERENCES "public_cms"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_applications_fk" FOREIGN KEY ("applications_id") REFERENCES "public_cms"."applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public_cms"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public_cms"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_pages_fk" FOREIGN KEY ("site_pages_id") REFERENCES "public_cms"."site_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public_cms"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public_cms"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public_cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public_cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public_cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_cms"."home_page" ADD CONSTRAINT "home_page_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_cms"."_home_page_v" ADD CONSTRAINT "_home_page_v_version_background_image_id_media_id_fk" FOREIGN KEY ("version_background_image_id") REFERENCES "public_cms"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "headlines_slug_idx" ON "public_cms"."headlines" USING btree ("slug");
  CREATE INDEX "headlines_image_idx" ON "public_cms"."headlines" USING btree ("image_id");
  CREATE INDEX "headlines_program_idx" ON "public_cms"."headlines" USING btree ("program_id");
  CREATE INDEX "headlines_seo_seo_image_idx" ON "public_cms"."headlines" USING btree ("seo_image_id");
  CREATE INDEX "headlines_updated_at_idx" ON "public_cms"."headlines" USING btree ("updated_at");
  CREATE INDEX "headlines_created_at_idx" ON "public_cms"."headlines" USING btree ("created_at");
  CREATE INDEX "headlines__status_idx" ON "public_cms"."headlines" USING btree ("_status");
  CREATE INDEX "_headlines_v_parent_idx" ON "public_cms"."_headlines_v" USING btree ("parent_id");
  CREATE INDEX "_headlines_v_version_version_slug_idx" ON "public_cms"."_headlines_v" USING btree ("version_slug");
  CREATE INDEX "_headlines_v_version_version_image_idx" ON "public_cms"."_headlines_v" USING btree ("version_image_id");
  CREATE INDEX "_headlines_v_version_version_program_idx" ON "public_cms"."_headlines_v" USING btree ("version_program_id");
  CREATE INDEX "_headlines_v_version_seo_version_seo_image_idx" ON "public_cms"."_headlines_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_headlines_v_version_version_updated_at_idx" ON "public_cms"."_headlines_v" USING btree ("version_updated_at");
  CREATE INDEX "_headlines_v_version_version_created_at_idx" ON "public_cms"."_headlines_v" USING btree ("version_created_at");
  CREATE INDEX "_headlines_v_version_version__status_idx" ON "public_cms"."_headlines_v" USING btree ("version__status");
  CREATE INDEX "_headlines_v_created_at_idx" ON "public_cms"."_headlines_v" USING btree ("created_at");
  CREATE INDEX "_headlines_v_updated_at_idx" ON "public_cms"."_headlines_v" USING btree ("updated_at");
  CREATE INDEX "_headlines_v_latest_idx" ON "public_cms"."_headlines_v" USING btree ("latest");
  CREATE INDEX "programs_dates_order_idx" ON "public_cms"."programs_dates" USING btree ("_order");
  CREATE INDEX "programs_dates_parent_id_idx" ON "public_cms"."programs_dates" USING btree ("_parent_id");
  CREATE INDEX "programs_gallery_order_idx" ON "public_cms"."programs_gallery" USING btree ("_order");
  CREATE INDEX "programs_gallery_parent_id_idx" ON "public_cms"."programs_gallery" USING btree ("_parent_id");
  CREATE INDEX "programs_gallery_image_idx" ON "public_cms"."programs_gallery" USING btree ("image_id");
  CREATE INDEX "programs_details_order_idx" ON "public_cms"."programs_details" USING btree ("_order");
  CREATE INDEX "programs_details_parent_id_idx" ON "public_cms"."programs_details" USING btree ("_parent_id");
  CREATE INDEX "programs_included_order_idx" ON "public_cms"."programs_included" USING btree ("_order");
  CREATE INDEX "programs_included_parent_id_idx" ON "public_cms"."programs_included" USING btree ("_parent_id");
  CREATE INDEX "programs_excluded_order_idx" ON "public_cms"."programs_excluded" USING btree ("_order");
  CREATE INDEX "programs_excluded_parent_id_idx" ON "public_cms"."programs_excluded" USING btree ("_parent_id");
  CREATE INDEX "programs_faq_order_idx" ON "public_cms"."programs_faq" USING btree ("_order");
  CREATE INDEX "programs_faq_parent_id_idx" ON "public_cms"."programs_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "public_cms"."programs" USING btree ("slug");
  CREATE INDEX "programs_category_idx" ON "public_cms"."programs" USING btree ("category_id");
  CREATE INDEX "programs_location_idx" ON "public_cms"."programs" USING btree ("location_id");
  CREATE INDEX "programs_cover_idx" ON "public_cms"."programs" USING btree ("cover_id");
  CREATE INDEX "programs_seo_seo_image_idx" ON "public_cms"."programs" USING btree ("seo_image_id");
  CREATE INDEX "programs_updated_at_idx" ON "public_cms"."programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "public_cms"."programs" USING btree ("created_at");
  CREATE INDEX "programs__status_idx" ON "public_cms"."programs" USING btree ("_status");
  CREATE INDEX "_programs_v_version_dates_order_idx" ON "public_cms"."_programs_v_version_dates" USING btree ("_order");
  CREATE INDEX "_programs_v_version_dates_parent_id_idx" ON "public_cms"."_programs_v_version_dates" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_gallery_order_idx" ON "public_cms"."_programs_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_programs_v_version_gallery_parent_id_idx" ON "public_cms"."_programs_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_gallery_image_idx" ON "public_cms"."_programs_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_programs_v_version_details_order_idx" ON "public_cms"."_programs_v_version_details" USING btree ("_order");
  CREATE INDEX "_programs_v_version_details_parent_id_idx" ON "public_cms"."_programs_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_included_order_idx" ON "public_cms"."_programs_v_version_included" USING btree ("_order");
  CREATE INDEX "_programs_v_version_included_parent_id_idx" ON "public_cms"."_programs_v_version_included" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_excluded_order_idx" ON "public_cms"."_programs_v_version_excluded" USING btree ("_order");
  CREATE INDEX "_programs_v_version_excluded_parent_id_idx" ON "public_cms"."_programs_v_version_excluded" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_version_faq_order_idx" ON "public_cms"."_programs_v_version_faq" USING btree ("_order");
  CREATE INDEX "_programs_v_version_faq_parent_id_idx" ON "public_cms"."_programs_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_programs_v_parent_idx" ON "public_cms"."_programs_v" USING btree ("parent_id");
  CREATE INDEX "_programs_v_version_version_slug_idx" ON "public_cms"."_programs_v" USING btree ("version_slug");
  CREATE INDEX "_programs_v_version_version_category_idx" ON "public_cms"."_programs_v" USING btree ("version_category_id");
  CREATE INDEX "_programs_v_version_version_location_idx" ON "public_cms"."_programs_v" USING btree ("version_location_id");
  CREATE INDEX "_programs_v_version_version_cover_idx" ON "public_cms"."_programs_v" USING btree ("version_cover_id");
  CREATE INDEX "_programs_v_version_seo_version_seo_image_idx" ON "public_cms"."_programs_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_programs_v_version_version_updated_at_idx" ON "public_cms"."_programs_v" USING btree ("version_updated_at");
  CREATE INDEX "_programs_v_version_version_created_at_idx" ON "public_cms"."_programs_v" USING btree ("version_created_at");
  CREATE INDEX "_programs_v_version_version__status_idx" ON "public_cms"."_programs_v" USING btree ("version__status");
  CREATE INDEX "_programs_v_created_at_idx" ON "public_cms"."_programs_v" USING btree ("created_at");
  CREATE INDEX "_programs_v_updated_at_idx" ON "public_cms"."_programs_v" USING btree ("updated_at");
  CREATE INDEX "_programs_v_latest_idx" ON "public_cms"."_programs_v" USING btree ("latest");
  CREATE INDEX "galleries_images_order_idx" ON "public_cms"."galleries_images" USING btree ("_order");
  CREATE INDEX "galleries_images_parent_id_idx" ON "public_cms"."galleries_images" USING btree ("_parent_id");
  CREATE INDEX "galleries_images_image_idx" ON "public_cms"."galleries_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "galleries_slug_idx" ON "public_cms"."galleries" USING btree ("slug");
  CREATE INDEX "galleries_cover_idx" ON "public_cms"."galleries" USING btree ("cover_id");
  CREATE INDEX "galleries_seo_seo_image_idx" ON "public_cms"."galleries" USING btree ("seo_image_id");
  CREATE INDEX "galleries_updated_at_idx" ON "public_cms"."galleries" USING btree ("updated_at");
  CREATE INDEX "galleries_created_at_idx" ON "public_cms"."galleries" USING btree ("created_at");
  CREATE INDEX "galleries__status_idx" ON "public_cms"."galleries" USING btree ("_status");
  CREATE INDEX "_galleries_v_version_images_order_idx" ON "public_cms"."_galleries_v_version_images" USING btree ("_order");
  CREATE INDEX "_galleries_v_version_images_parent_id_idx" ON "public_cms"."_galleries_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_galleries_v_version_images_image_idx" ON "public_cms"."_galleries_v_version_images" USING btree ("image_id");
  CREATE INDEX "_galleries_v_parent_idx" ON "public_cms"."_galleries_v" USING btree ("parent_id");
  CREATE INDEX "_galleries_v_version_version_slug_idx" ON "public_cms"."_galleries_v" USING btree ("version_slug");
  CREATE INDEX "_galleries_v_version_version_cover_idx" ON "public_cms"."_galleries_v" USING btree ("version_cover_id");
  CREATE INDEX "_galleries_v_version_seo_version_seo_image_idx" ON "public_cms"."_galleries_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_galleries_v_version_version_updated_at_idx" ON "public_cms"."_galleries_v" USING btree ("version_updated_at");
  CREATE INDEX "_galleries_v_version_version_created_at_idx" ON "public_cms"."_galleries_v" USING btree ("version_created_at");
  CREATE INDEX "_galleries_v_version_version__status_idx" ON "public_cms"."_galleries_v" USING btree ("version__status");
  CREATE INDEX "_galleries_v_created_at_idx" ON "public_cms"."_galleries_v" USING btree ("created_at");
  CREATE INDEX "_galleries_v_updated_at_idx" ON "public_cms"."_galleries_v" USING btree ("updated_at");
  CREATE INDEX "_galleries_v_latest_idx" ON "public_cms"."_galleries_v" USING btree ("latest");
  CREATE INDEX "applications_program_idx" ON "public_cms"."applications" USING btree ("program_id");
  CREATE INDEX "applications_updated_at_idx" ON "public_cms"."applications" USING btree ("updated_at");
  CREATE INDEX "applications_created_at_idx" ON "public_cms"."applications" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "public_cms"."categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "public_cms"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "public_cms"."categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "locations_slug_idx" ON "public_cms"."locations" USING btree ("slug");
  CREATE INDEX "locations_cover_idx" ON "public_cms"."locations" USING btree ("cover_id");
  CREATE INDEX "locations_updated_at_idx" ON "public_cms"."locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "public_cms"."locations" USING btree ("created_at");
  CREATE INDEX "site_pages_blocks_rich_content_order_idx" ON "public_cms"."site_pages_blocks_rich_content" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_rich_content_parent_id_idx" ON "public_cms"."site_pages_blocks_rich_content" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_rich_content_path_idx" ON "public_cms"."site_pages_blocks_rich_content" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_media_text_order_idx" ON "public_cms"."site_pages_blocks_media_text" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_media_text_parent_id_idx" ON "public_cms"."site_pages_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_media_text_path_idx" ON "public_cms"."site_pages_blocks_media_text" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_media_text_image_idx" ON "public_cms"."site_pages_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "site_pages_blocks_feature_list_items_order_idx" ON "public_cms"."site_pages_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_feature_list_items_parent_id_idx" ON "public_cms"."site_pages_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_feature_list_order_idx" ON "public_cms"."site_pages_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_feature_list_parent_id_idx" ON "public_cms"."site_pages_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_feature_list_path_idx" ON "public_cms"."site_pages_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_call_to_action_order_idx" ON "public_cms"."site_pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_call_to_action_parent_id_idx" ON "public_cms"."site_pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_call_to_action_path_idx" ON "public_cms"."site_pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_contact_form_order_idx" ON "public_cms"."site_pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_contact_form_parent_id_idx" ON "public_cms"."site_pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_contact_form_path_idx" ON "public_cms"."site_pages_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_gallery_order_idx" ON "public_cms"."site_pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_gallery_parent_id_idx" ON "public_cms"."site_pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_gallery_path_idx" ON "public_cms"."site_pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_gallery_gallery_idx" ON "public_cms"."site_pages_blocks_gallery" USING btree ("gallery_id");
  CREATE INDEX "site_pages_blocks_location_grid_order_idx" ON "public_cms"."site_pages_blocks_location_grid" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_location_grid_parent_id_idx" ON "public_cms"."site_pages_blocks_location_grid" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_location_grid_path_idx" ON "public_cms"."site_pages_blocks_location_grid" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_program_grid_order_idx" ON "public_cms"."site_pages_blocks_program_grid" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_program_grid_parent_id_idx" ON "public_cms"."site_pages_blocks_program_grid" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_program_grid_path_idx" ON "public_cms"."site_pages_blocks_program_grid" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_testimonial_grid_order_idx" ON "public_cms"."site_pages_blocks_testimonial_grid" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_testimonial_grid_parent_id_idx" ON "public_cms"."site_pages_blocks_testimonial_grid" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_testimonial_grid_path_idx" ON "public_cms"."site_pages_blocks_testimonial_grid" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_partner_grid_order_idx" ON "public_cms"."site_pages_blocks_partner_grid" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_partner_grid_parent_id_idx" ON "public_cms"."site_pages_blocks_partner_grid" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_partner_grid_path_idx" ON "public_cms"."site_pages_blocks_partner_grid" USING btree ("_path");
  CREATE INDEX "site_pages_blocks_headline_grid_order_idx" ON "public_cms"."site_pages_blocks_headline_grid" USING btree ("_order");
  CREATE INDEX "site_pages_blocks_headline_grid_parent_id_idx" ON "public_cms"."site_pages_blocks_headline_grid" USING btree ("_parent_id");
  CREATE INDEX "site_pages_blocks_headline_grid_path_idx" ON "public_cms"."site_pages_blocks_headline_grid" USING btree ("_path");
  CREATE INDEX "site_pages_home_metrics_order_idx" ON "public_cms"."site_pages_home_metrics" USING btree ("_order");
  CREATE INDEX "site_pages_home_metrics_parent_id_idx" ON "public_cms"."site_pages_home_metrics" USING btree ("_parent_id");
  CREATE INDEX "site_pages_home_process_steps_order_idx" ON "public_cms"."site_pages_home_process_steps" USING btree ("_order");
  CREATE INDEX "site_pages_home_process_steps_parent_id_idx" ON "public_cms"."site_pages_home_process_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_pages_slug_idx" ON "public_cms"."site_pages" USING btree ("slug");
  CREATE INDEX "site_pages_hero_hero_image_idx" ON "public_cms"."site_pages" USING btree ("hero_image_id");
  CREATE INDEX "site_pages_seo_seo_image_idx" ON "public_cms"."site_pages" USING btree ("seo_image_id");
  CREATE INDEX "site_pages_updated_at_idx" ON "public_cms"."site_pages" USING btree ("updated_at");
  CREATE INDEX "site_pages_created_at_idx" ON "public_cms"."site_pages" USING btree ("created_at");
  CREATE INDEX "site_pages__status_idx" ON "public_cms"."site_pages" USING btree ("_status");
  CREATE INDEX "_site_pages_v_blocks_rich_content_order_idx" ON "public_cms"."_site_pages_v_blocks_rich_content" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_rich_content_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_rich_content" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_rich_content_path_idx" ON "public_cms"."_site_pages_v_blocks_rich_content" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_media_text_order_idx" ON "public_cms"."_site_pages_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_media_text_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_media_text_path_idx" ON "public_cms"."_site_pages_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_media_text_image_idx" ON "public_cms"."_site_pages_v_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "_site_pages_v_blocks_feature_list_items_order_idx" ON "public_cms"."_site_pages_v_blocks_feature_list_items" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_feature_list_items_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_feature_list_items" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_feature_list_order_idx" ON "public_cms"."_site_pages_v_blocks_feature_list" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_feature_list_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_feature_list" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_feature_list_path_idx" ON "public_cms"."_site_pages_v_blocks_feature_list" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_call_to_action_order_idx" ON "public_cms"."_site_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_call_to_action_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_call_to_action_path_idx" ON "public_cms"."_site_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_contact_form_order_idx" ON "public_cms"."_site_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_contact_form_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_contact_form_path_idx" ON "public_cms"."_site_pages_v_blocks_contact_form" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_gallery_order_idx" ON "public_cms"."_site_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_gallery_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_gallery_path_idx" ON "public_cms"."_site_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_gallery_gallery_idx" ON "public_cms"."_site_pages_v_blocks_gallery" USING btree ("gallery_id");
  CREATE INDEX "_site_pages_v_blocks_location_grid_order_idx" ON "public_cms"."_site_pages_v_blocks_location_grid" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_location_grid_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_location_grid" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_location_grid_path_idx" ON "public_cms"."_site_pages_v_blocks_location_grid" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_program_grid_order_idx" ON "public_cms"."_site_pages_v_blocks_program_grid" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_program_grid_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_program_grid" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_program_grid_path_idx" ON "public_cms"."_site_pages_v_blocks_program_grid" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_testimonial_grid_order_idx" ON "public_cms"."_site_pages_v_blocks_testimonial_grid" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_testimonial_grid_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_testimonial_grid" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_testimonial_grid_path_idx" ON "public_cms"."_site_pages_v_blocks_testimonial_grid" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_partner_grid_order_idx" ON "public_cms"."_site_pages_v_blocks_partner_grid" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_partner_grid_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_partner_grid" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_partner_grid_path_idx" ON "public_cms"."_site_pages_v_blocks_partner_grid" USING btree ("_path");
  CREATE INDEX "_site_pages_v_blocks_headline_grid_order_idx" ON "public_cms"."_site_pages_v_blocks_headline_grid" USING btree ("_order");
  CREATE INDEX "_site_pages_v_blocks_headline_grid_parent_id_idx" ON "public_cms"."_site_pages_v_blocks_headline_grid" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_blocks_headline_grid_path_idx" ON "public_cms"."_site_pages_v_blocks_headline_grid" USING btree ("_path");
  CREATE INDEX "_site_pages_v_version_home_metrics_order_idx" ON "public_cms"."_site_pages_v_version_home_metrics" USING btree ("_order");
  CREATE INDEX "_site_pages_v_version_home_metrics_parent_id_idx" ON "public_cms"."_site_pages_v_version_home_metrics" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_version_home_process_steps_order_idx" ON "public_cms"."_site_pages_v_version_home_process_steps" USING btree ("_order");
  CREATE INDEX "_site_pages_v_version_home_process_steps_parent_id_idx" ON "public_cms"."_site_pages_v_version_home_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_site_pages_v_parent_idx" ON "public_cms"."_site_pages_v" USING btree ("parent_id");
  CREATE INDEX "_site_pages_v_version_version_slug_idx" ON "public_cms"."_site_pages_v" USING btree ("version_slug");
  CREATE INDEX "_site_pages_v_version_hero_version_hero_image_idx" ON "public_cms"."_site_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_site_pages_v_version_seo_version_seo_image_idx" ON "public_cms"."_site_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_site_pages_v_version_version_updated_at_idx" ON "public_cms"."_site_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_pages_v_version_version_created_at_idx" ON "public_cms"."_site_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_site_pages_v_version_version__status_idx" ON "public_cms"."_site_pages_v" USING btree ("version__status");
  CREATE INDEX "_site_pages_v_created_at_idx" ON "public_cms"."_site_pages_v" USING btree ("created_at");
  CREATE INDEX "_site_pages_v_updated_at_idx" ON "public_cms"."_site_pages_v" USING btree ("updated_at");
  CREATE INDEX "_site_pages_v_latest_idx" ON "public_cms"."_site_pages_v" USING btree ("latest");
  CREATE INDEX "testimonials_updated_at_idx" ON "public_cms"."testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "public_cms"."testimonials" USING btree ("created_at");
  CREATE INDEX "partners_logo_idx" ON "public_cms"."partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "public_cms"."partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "public_cms"."partners" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "public_cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "public_cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "public_cms"."media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "public_cms"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "public_cms"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "public_cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "public_cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "public_cms"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "public_cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "public_cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "public_cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "public_cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_headlines_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("headlines_id");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_galleries_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("galleries_id");
  CREATE INDEX "payload_locked_documents_rels_applications_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_site_pages_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("site_pages_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "public_cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "public_cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "public_cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "public_cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "public_cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "public_cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "public_cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "public_cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "public_cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "public_cms"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_background_image_idx" ON "public_cms"."home_page" USING btree ("background_image_id");
  CREATE INDEX "home_page__status_idx" ON "public_cms"."home_page" USING btree ("_status");
  CREATE INDEX "_home_page_v_version_version_background_image_idx" ON "public_cms"."_home_page_v" USING btree ("version_background_image_id");
  CREATE INDEX "_home_page_v_version_version__status_idx" ON "public_cms"."_home_page_v" USING btree ("version__status");
  CREATE INDEX "_home_page_v_created_at_idx" ON "public_cms"."_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "public_cms"."_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_latest_idx" ON "public_cms"."_home_page_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "public_cms"."headlines" CASCADE;
  DROP TABLE "public_cms"."_headlines_v" CASCADE;
  DROP TABLE "public_cms"."programs_dates" CASCADE;
  DROP TABLE "public_cms"."programs_gallery" CASCADE;
  DROP TABLE "public_cms"."programs_details" CASCADE;
  DROP TABLE "public_cms"."programs_included" CASCADE;
  DROP TABLE "public_cms"."programs_excluded" CASCADE;
  DROP TABLE "public_cms"."programs_faq" CASCADE;
  DROP TABLE "public_cms"."programs" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_dates" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_gallery" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_details" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_included" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_excluded" CASCADE;
  DROP TABLE "public_cms"."_programs_v_version_faq" CASCADE;
  DROP TABLE "public_cms"."_programs_v" CASCADE;
  DROP TABLE "public_cms"."galleries_images" CASCADE;
  DROP TABLE "public_cms"."galleries" CASCADE;
  DROP TABLE "public_cms"."_galleries_v_version_images" CASCADE;
  DROP TABLE "public_cms"."_galleries_v" CASCADE;
  DROP TABLE "public_cms"."applications" CASCADE;
  DROP TABLE "public_cms"."categories" CASCADE;
  DROP TABLE "public_cms"."locations" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_rich_content" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_media_text" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_feature_list_items" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_feature_list" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_call_to_action" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_contact_form" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_gallery" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_location_grid" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_program_grid" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_testimonial_grid" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_partner_grid" CASCADE;
  DROP TABLE "public_cms"."site_pages_blocks_headline_grid" CASCADE;
  DROP TABLE "public_cms"."site_pages_home_metrics" CASCADE;
  DROP TABLE "public_cms"."site_pages_home_process_steps" CASCADE;
  DROP TABLE "public_cms"."site_pages" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_rich_content" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_media_text" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_feature_list_items" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_feature_list" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_contact_form" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_location_grid" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_program_grid" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_testimonial_grid" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_partner_grid" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_blocks_headline_grid" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_version_home_metrics" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v_version_home_process_steps" CASCADE;
  DROP TABLE "public_cms"."_site_pages_v" CASCADE;
  DROP TABLE "public_cms"."testimonials" CASCADE;
  DROP TABLE "public_cms"."partners" CASCADE;
  DROP TABLE "public_cms"."media" CASCADE;
  DROP TABLE "public_cms"."users_sessions" CASCADE;
  DROP TABLE "public_cms"."users" CASCADE;
  DROP TABLE "public_cms"."payload_kv" CASCADE;
  DROP TABLE "public_cms"."payload_locked_documents" CASCADE;
  DROP TABLE "public_cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "public_cms"."payload_preferences" CASCADE;
  DROP TABLE "public_cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "public_cms"."payload_migrations" CASCADE;
  DROP TABLE "public_cms"."site_settings" CASCADE;
  DROP TABLE "public_cms"."home_page" CASCADE;
  DROP TABLE "public_cms"."_home_page_v" CASCADE;
  DROP TYPE "public_cms"."enum_headlines_workflow_status";
  DROP TYPE "public_cms"."enum_headlines_link_type";
  DROP TYPE "public_cms"."enum_headlines_status";
  DROP TYPE "public_cms"."enum__headlines_v_version_workflow_status";
  DROP TYPE "public_cms"."enum__headlines_v_version_link_type";
  DROP TYPE "public_cms"."enum__headlines_v_version_status";
  DROP TYPE "public_cms"."enum_programs_dates_capacity_status";
  DROP TYPE "public_cms"."enum_programs_workflow_status";
  DROP TYPE "public_cms"."enum_programs_availability_status";
  DROP TYPE "public_cms"."enum_programs_region";
  DROP TYPE "public_cms"."enum_programs_status";
  DROP TYPE "public_cms"."enum__programs_v_version_dates_capacity_status";
  DROP TYPE "public_cms"."enum__programs_v_version_workflow_status";
  DROP TYPE "public_cms"."enum__programs_v_version_availability_status";
  DROP TYPE "public_cms"."enum__programs_v_version_region";
  DROP TYPE "public_cms"."enum__programs_v_version_status";
  DROP TYPE "public_cms"."enum_galleries_workflow_status";
  DROP TYPE "public_cms"."enum_galleries_status";
  DROP TYPE "public_cms"."enum__galleries_v_version_workflow_status";
  DROP TYPE "public_cms"."enum__galleries_v_version_status";
  DROP TYPE "public_cms"."enum_applications_status";
  DROP TYPE "public_cms"."enum_applications_legacy_sync_status";
  DROP TYPE "public_cms"."enum_categories_type";
  DROP TYPE "public_cms"."enum_site_pages_blocks_rich_content_width";
  DROP TYPE "public_cms"."enum_site_pages_blocks_media_text_image_position";
  DROP TYPE "public_cms"."enum_site_pages_blocks_feature_list_items_icon";
  DROP TYPE "public_cms"."enum_site_pages_blocks_feature_list_columns";
  DROP TYPE "public_cms"."enum_site_pages_blocks_call_to_action_tone";
  DROP TYPE "public_cms"."enum_site_pages_blocks_gallery_display";
  DROP TYPE "public_cms"."enum_site_pages_home_metrics_icon";
  DROP TYPE "public_cms"."enum_site_pages_workflow_status";
  DROP TYPE "public_cms"."enum_site_pages_page_type";
  DROP TYPE "public_cms"."enum_site_pages_hero_style";
  DROP TYPE "public_cms"."enum_site_pages_status";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_rich_content_width";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_media_text_image_position";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_feature_list_items_icon";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_feature_list_columns";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_call_to_action_tone";
  DROP TYPE "public_cms"."enum__site_pages_v_blocks_gallery_display";
  DROP TYPE "public_cms"."enum__site_pages_v_version_home_metrics_icon";
  DROP TYPE "public_cms"."enum__site_pages_v_version_workflow_status";
  DROP TYPE "public_cms"."enum__site_pages_v_version_page_type";
  DROP TYPE "public_cms"."enum__site_pages_v_version_hero_style";
  DROP TYPE "public_cms"."enum__site_pages_v_version_status";
  DROP TYPE "public_cms"."enum_users_role";
  DROP TYPE "public_cms"."enum_home_page_overlay_strength";
  DROP TYPE "public_cms"."enum_home_page_status";
  DROP TYPE "public_cms"."enum__home_page_v_version_overlay_strength";
  DROP TYPE "public_cms"."enum__home_page_v_version_status";`)
}
