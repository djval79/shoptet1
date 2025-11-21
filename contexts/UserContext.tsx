import React, { createContext, useContext, ReactNode } from 'react';
import { User, AgencySettings } from '../types';
import { DEFAULT_AGENCY_SETTINGS } from '../constants';
import { usePersistedState } from '../hooks/usePersistedState';

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    agencySettings: AgencySettings;
    setAgencySettings: React.Dispatch<React.SetStateAction<AgencySettings>>;
    login: (user: User) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = usePersistedState<User | null>('shoptet_user', null);
    const [agencySettings, setAgencySettings] = usePersistedState<AgencySettings>('shoptet_agency_settings', DEFAULT_AGENCY_SETTINGS);

    const login = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, agencySettings, setAgencySettings, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
