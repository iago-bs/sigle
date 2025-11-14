
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnqiuipfbklffkygilzk.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWl1aXBmYmtsZmZreWdpbHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNjc0NTAsImV4cCI6MjA0Njk0MzQ1MH0.YkJwgC_3fwhWdUE1_7xRl8uqfqDgfFnJf2sGaaTMGCE'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
