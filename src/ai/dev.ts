'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-related-tasks.ts';
import '@/ai/flows/generate-list-icon.ts';
