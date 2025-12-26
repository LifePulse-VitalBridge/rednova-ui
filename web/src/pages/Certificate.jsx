import CertificateSection from '../components/CertificateSection';

export default function Certificate() {
    const user = { id: 'current_user_id' }; // Get from context/auth
    return (
        <main className="min-h-screen bg-black text-white p-10">
            <h1 className="text-4xl mb-10">Rednova Vital Center</h1>
            <CertificateSection donorId={user.id} />
        </main>
    );
}