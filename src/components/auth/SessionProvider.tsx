"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext, useState } from "react";

interface LoggedInSessionValues {
  user: User;
  session: Session;
}
interface SessionValues {
  user: User | null;
  session: Session | null;
}
type SessionContextType = SessionValues & {
  setSession: (session: SessionValues) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionValues | null }>) => {
  const [session, setSession] = useState<SessionValues | null>(value);

  return (
    <SessionContext.Provider
      value={{
        user: session?.user || null,
        session: session?.session || null,
        setSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useNonRequiredSession = () => {
  const context = useContext(SessionContext);

  return context;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context || !context.user || !context.session) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context as LoggedInSessionValues;
};
