using my.recharge from '../db/dbmodel';




service RechargeService {
  entity RechargeType as projection on recharge.RechargeType;
   entity TaxCodes     as projection on recharge.TaxCodes;
}