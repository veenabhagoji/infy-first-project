const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
const { RechargeType } = this.entities;

this.on('MassUploadRechargeTypes', async (req) => {
  
    const data = req.data.rechargeTypes;

    if (!Array.isArray(data) || data.length === 0) {
      return req.error(400, 'No rechargeTypes data provided');
    }
    
    //Optional: Validate required fields
    for (const item of data) {
      if (!item.rechargeTypeId || !item.version) {
        return req.error(400, 'Each entry must have rechargeTypeId and version ');
      }
    }
    
    try {
      const tx = cds.tx(req);
      await tx.run(INSERT.into(RechargeType).entries(data));
      return { success: true, count: data.length };
    } catch (err) {
      console.error('Upload error:', err);
      return req.error(500, 'Upload failed: ' + err.message);
    }
    });
    });