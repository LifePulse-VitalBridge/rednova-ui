import Donor from '../models/Donor.js';
import { generateAndUploadCertificate, mintOnPolygon } from '../utils/blockchainUtils.js';

export const handleCertificate = async (req, res) => {
    const { donorId } = req.params;
    try {
        const donor = await Donor.findOne({firebaseUid: donorId});
        
        if (!donor.certificateApproved) {
            return res.json({ success: false, status: 'pending' });
        }

        if (donor.certificateCID) {
            return res.json({ success: true, cid: donor.certificateCID });
        }

        // Run creation logic if approved but no CID exists
        const cid = await generateAndUploadCertificate(donor.name);
        await mintOnPolygon(donor.walletAddress, cid);

        donor.certificateCID = cid;
        await donor.save();

        res.json({ success: true, cid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};