import { redirect } from 'next/navigation';

export default function PlaygroundPage() {
  // Redirect to default model playground
  redirect('/playground/gpt-oss-20b');
}

