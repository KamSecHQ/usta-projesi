import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ADRESI, SUPABASE_ANAHTARI } from './supabaseAyarlari'

export const supabase = createClient(SUPABASE_ADRESI, SUPABASE_ANAHTARI)
