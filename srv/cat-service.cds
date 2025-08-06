using my.recharge from '../db/dbmodel';




service RechargeService {
  entity RechargeType as projection on recharge.RechargeType;
  
    action MassUploadRechargeTypes(rechargeTypes: array of {
  rechargeTypeId      : String(30);
  version             : String(30);
  rechargeType            : String(50);
  rechargeTypeDesc        : String(255);
  rechargeAssessmentReq   : Boolean;
  taxCode                 : String(20);
  validFrom               : Date;
  validTo                 : Date;
   comment               : String(50);
    })
    returns { success: Boolean; count: Integer; };

   entity TaxCodes     as projection on recharge.TaxCodes;
   
}