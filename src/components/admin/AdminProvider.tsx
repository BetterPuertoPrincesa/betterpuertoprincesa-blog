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
import { Clock, LoaderCircle, LogOut } from 'lucide-react';
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
  | { kind: 'pending'; user: User }
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

  const verify = useCallback(async (user: User) => {
    setState({ kind: 'loading' });
    // If the check itself fails (server error, network, or a page left
    // open across a deploy), show it instead of spinning forever.
    try {
      const result = await checkEditor(await user.getIdToken());
      if (result.status === 'editor') setState({ kind: 'ready', user });
      else if (result.status === 'pending') setState({ kind: 'pending', user });
      else setState({ kind: 'error', user, message: result.message });
    } catch (e) {
      setState({ kind: 'error', user, message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(clientAuth(), user => {
      if (!user) setState({ kind: 'signed-out' });
      else verify(user);
    });
  }, [verify]);

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

  if (state.kind === 'pending') {
    return (
      <Panel>
        <Clock
          className="mx-auto h-10 w-10 text-balayong-500"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-display text-3xl">Waiting for access</h1>
        <p className="mt-3 text-gray-700">
          Thanks for signing in, {state.user.displayName ?? 'there'}. A
          maintainer needs to approve your account before you can write posts.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Send them this user ID so they can add you:
        </p>
        <code className="mt-2 block rounded bg-gray-100 px-2 py-1 font-mono text-xs break-all">
          {state.user.uid}
        </code>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => verify(state.user)}
            className="rounded-full bg-primary-700 px-5 py-2.5 font-bold text-white hover:bg-primary-800"
          >
            Check again
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
