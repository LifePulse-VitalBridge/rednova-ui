import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from "firebase/auth"; //

const CertificateSection = () => {
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(); //

    useEffect(() => {
        // Observer for Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Use the REAL Firebase UID here
                    const response = await axios.get(`/api/certificate/${user.uid}`);
                    setCertData(response.data);
                } catch (err) {
                    console.error("Backend sync error", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                // Handle signed-out state if necessary
            }
        });

        return () => unsubscribe(); // Cleanup listener
    }, [auth]);

    if (loading) return <p className="animate-pulse text-purple-400">Syncing with Rednova Records...</p>;

    if (!certData || !certData.success) {
        return (
            <div className="glass-morphism p-8 text-center border border-purple-500/30 rounded-2xl bg-black/40">
                <h2 className="text-2xl font-bold text-white mb-2 text-glow">Patience, Explorer!</h2>
                <p className="text-gray-400">Your donation is being verified. Once approved, your unique blockchain certificate will manifest here.</p>
            </div>
        );
    }

    const ipfsUrl = `https://gateway.lighthouse.storage/ipfs/${certData.cid}`;
    
    return (
        <div className="certificate-container text-center space-y-6">
            <div className="relative inline-block group">
                <img src={ipfsUrl} alt="Donor Certificate" className="rounded-lg shadow-2xl border-2 border-purple-500 max-w-lg transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-purple-500/10 rounded-lg pointer-events-none"></div>
            </div>
            <div className="flex justify-center gap-4">
                <a href={ipfsUrl} download className="bg-purple-600 px-8 py-3 rounded-full text-white font-bold hover:bg-purple-700 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                    Download Certificate
                </a>
            </div>
        </div>
    );
};

export default CertificateSection;