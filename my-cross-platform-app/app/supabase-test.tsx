import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

type Todo = { id: number; title: string | null };

export default function SupabaseTestScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Todo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: err } = await supabase.from('todos').select('id, title').limit(5);
        if (err) throw err;
        setRows(data ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
        <Text style={styles.msg}>Connecting to Supabase…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
        <Text style={styles.hint}>Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase test (first 5 rows from todos)</Text>
      {rows.length === 0 ? (
        <Text style={styles.msg}>No rows.</Text>
      ) : (
        rows.map((r) => (
          <Text key={r.id} style={styles.row}>#{r.id}: {r.title}</Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000' },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: { color: '#ddd', marginBottom: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  msg: { color: '#aaa', marginTop: 8 },
  error: { color: '#ef4444', fontWeight: '600', marginBottom: 8 },
  hint: { color: '#aaa' },
});




