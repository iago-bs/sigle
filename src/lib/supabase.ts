
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwgdfveokzemavstpvyv.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2RmdmVva3plbWF2c3Rwdnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzA3MTksImV4cCI6MjA3ODA0NjcxOX0.JaZjZkWEzkp5k-eiuPX-_MQ-mTXAALSNoxv2WjHZdRk'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
