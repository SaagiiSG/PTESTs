import React from 'react';
import TestCards from '@/components/home/TestCards';
import { headers } from 'next/headers';
import CreateTestForm from './CreateTestForm';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { auth } from '@/lib/auth';
import { IUser } from '@/app/models/user';
import { redirect } from 'next/navigation';

function getApiUrl(path: string) {
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

async function fetchTests() {
  const res = await fetch(getApiUrl('/api/tests'), { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function CreateTestPage() {
  const session = await auth();
  const admin: IUser | undefined = session?.user as IUser | undefined;
  if (!admin?.isAdmin) {
    redirect('/home');
  }
  const tests = await fetchTests();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="col-span-2">
        <Breadcrumbs />
      </div>
      {/* Create Test Form */}
      <Card className="rounded-2xl bg-muted shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Create Test</h2>
        <CreateTestForm />
      </Card>
      {/* All Tests */}
      <Card className="rounded-2xl bg-muted shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-2">All Tests</h3>
        <div className="flex flex-col gap-4">
          {tests.length === 0 ? <div className="text-gray-500">No tests found.</div> :
            tests.map((test: any) => (
              <TestCards key={test._id} hr={test.title} shortDes={test.description?.mn || test.description?.en || ''} slug={test.slug || test._id} variant="small" thumbnailUrl={test.thumbnailUrl} price={test.price} />
            ))}
        </div>
      </Card>
    </div>
  );
} 