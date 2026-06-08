import * as migration_20260607_235046_initial_public_cms from './20260607_235046_initial_public_cms';

export const migrations = [
  {
    up: migration_20260607_235046_initial_public_cms.up,
    down: migration_20260607_235046_initial_public_cms.down,
    name: '20260607_235046_initial_public_cms'
  },
];
