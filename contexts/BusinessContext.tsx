import React, { createContext, useContext, ReactNode } from 'react';
import { BusinessProfile } from '../types';
import { MOCK_BUSINESSES } from '../constants';
import { usePersistedState } from '../hooks/usePersistedState';

interface BusinessContextType {
    businesses: BusinessProfile[];
    setBusinesses: React.Dispatch<React.SetStateAction<BusinessProfile[]>>;
    activeBusinessId: string;
    setActiveBusinessId: React.Dispatch<React.SetStateAction<string>>;
    activeBusiness: BusinessProfile;
    updateBusiness: (updated: BusinessProfile) => void;
    addBusiness: (newBusiness: BusinessProfile) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [businesses, setBusinesses] = usePersistedState<BusinessProfile[]>('shoptet_businesses', MOCK_BUSINESSES);
    const [activeBusinessId, setActiveBusinessId] = usePersistedState<string>('shoptet_active_business_id', MOCK_BUSINESSES[0].id);

    const activeBusiness = businesses.find(b => b.id === activeBusinessId) || businesses[0];

    const updateBusiness = (updated: BusinessProfile) => {
        setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
    };

    const addBusiness = (newBusiness: BusinessProfile) => {
        setBusinesses(prev => [...prev, newBusiness]);
        setActiveBusinessId(newBusiness.id);
    };

    return (
        <BusinessContext.Provider value={{
            businesses,
            setBusinesses,
            activeBusinessId,
            setActiveBusinessId,
            activeBusiness,
            updateBusiness,
            addBusiness
        }}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (!context) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};
