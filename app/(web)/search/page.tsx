// app/(web)/(search)/page.tsx
import { Suspense } from 'react';
import { FeedClient } from '../_components/feed-client';
import { Loader } from '@/components/ui/loader';

export const instant = false;

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[calc(100dvh-4rem)]" />}>
      {/* На странице поиска isSearchPage = true */}
      <FeedClient isSearchPage={true} />
    </Suspense>
  );
}