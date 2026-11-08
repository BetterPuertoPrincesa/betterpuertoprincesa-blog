'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { LoaderCircle, LogOut } from 'lucide-react';
import { checkEditor } from '@/app/admin/actions';
import { clientAuth, isFirebaseConfigured } from '@/lib/firebase/client';

interface AdminContextValue {
  user: User;
  getToken: () => Promise<string>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin must be used inside <AdminProvider>');
  return value;
}

type State =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'denied'; user: User; message: string }
  | { kind: 'error'; user: User; message: string }
  | { kind: 'ready'; user: User };

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
        {children}
      </div>
    </div>
  );
}

export default function AdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [error, setError] = useState<string | null>(null);
  const getToken = useCallback(async () => {
    const current = clientAuth().currentUser;
    if (!current) throw new Error('You have been signed out.');
    return current.getIdToken();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(clientAuth(), async user => {
      if (!user) return setState({ kind: 'signed-out' });
      setState({ kind: 'loading' });
      // If the check itself fails (server error, network, or a page left
      // open across a deploy), show it instead of spinning forever.
      try {
        const result = await checkEditor(await user.getIdToken());
        setState(
          result.ok
            ? { kind: 'ready', user }
            : { kind: 'denied', user, message: result.message }
        );
      } catch (e) {
        setState({ kind: 'error', user, message: (e as Error).message });
      }
    });
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <Panel>
        <h1 className="font-display text-2xl">Firebase isn&apos;t set up</h1>
        <p className="mt-3 text-gray-700">
          Add the NEXT_PUBLIC_FIREBASE_* values to your environment, then reload
          this page. See the README for the full list.
        </p>
      </Panel>
    );
  }

  if (state.kind === 'loading') {
    return (
      <Panel>
        <LoaderCircle
          className="mx-auto h-6 w-6 animate-spin text-primary-600"
          aria-label="Loading"
        />
      </Panel>
    );
  }

  if (state.kind === 'signed-out') {
    return (
      <Panel>
        <h1 className="font-display text-3xl">Editor sign in</h1>
        <p className="mt-3 text-gray-700">
          This area is for blog editors. Sign in with the Google account that
          was added to the editors list.
        </p>
        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              await signInWithPopup(clientAuth(), new GoogleAuthProvider());
            } catch (e) {
              setError((e as Error).message);
            }
          }}
          className="mt-6 rounded-full bg-primary-700 px-5 py-2.5 font-bold text-white hover:bg-primary-800"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-4 text-sm text-error-600">{error}</p>}
      </Panel>
    );
  }

  if (state.kind === 'error') {
    return (
      <Panel>
        <h1 className="font-display text-2xl">
          We couldn&apos;t check your access
        </h1>
        <p className="mt-3 text-gray-700">
          Something went wrong talking to the server. Reloading the page usually
          fixes it, especially right after the site was updated.
        </p>
        <p className="mt-3 rounded bg-gray-100 px-2 py-1 font-mono text-xs break-all text-gray-700">
          {state.message}
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary-700 px-5 py-2.5 font-bold text-white hover:bg-primary-800"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => signOut(clientAuth())}
            className="text-sm font-bold text-primary-700 underline underline-offset-4"
          >
            Sign out
          </button>
        </div>
      </Panel>
    );
  }

  if (state.kind === 'denied') {
    return (
      <Panel>
        <h1 className="font-display text-2xl">No editor access</h1>
        <p className="mt-3 text-gray-700">{state.message}</p>
        <p className="mt-3 text-sm text-gray-600">
          Ask a maintainer to add this user ID to the editors list:
          <code className="mt-2 block rounded bg-gray-100 px-2 py-1 font-mono text-xs break-all">
            {state.user.uid}
          </code>
        </p>
        <button
          type="button"
          onClick={() => signOut(clientAuth())}
          className="mt-6 text-sm font-bold text-primary-700 underline underline-offset-4"
        >
          Sign out
        </button>
      </Panel>
    );
  }

  const { user } = state;
  return (
    <AdminContext.Provider value={{ user, getToken }}>
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2 text-sm text-gray-700">
          <span className="truncate">
            Signed in as <strong>{user.displayName ?? user.email}</strong>
          </span>
          <button
            type="button"
            onClick={() => signOut(clientAuth())}
            className="flex shrink-0 items-center gap-1.5 font-bold text-primary-700 hover:text-primary-900"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
      {children}
    </AdminContext.Provider>
  );
}
