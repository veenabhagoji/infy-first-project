using my.recharge from '../db/dbmodel';




service RechargeService {
  entity RechargeType as projection on recharge.RechargeType;
}