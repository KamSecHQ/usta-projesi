import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lalqdppmjirelxngliim.supabase.co'
const supabaseKey = 'sb_publishable_4_QRTlzAS4J74myS9klBng_SNF8kN42'

export const supabase = createClient(supabaseUrl, supabaseKey) 