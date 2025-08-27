'use client';

import { useSearchParams } from 'next/navigation';

export default function CreatePostClientView() {
  // This hook can only be used in a Client Component.
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  return (
    <form>
      <p>
        Creating a new post for topic: <strong>{topic || 'Not specified'}</strong>
      </p>
      {/* Your form fields would go here */}
    </form>
  );
}