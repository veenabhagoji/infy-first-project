using RechargeService as service from '../srv/cat-service';

annotate service.RechargeType.taxCode with @(
  Common.ValueList: {
    Label: 'Tax Code',
    CollectionPath: 'TaxCodes',
    Parameters: [
      { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: 'taxCode', ValueListProperty: 'code' },
      { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'description' }
    ]
  }
);


annotate service.RechargeType with @(
  UI.LineItem: [
    { Value: rechargeTypeId },
    { Value: version },
    { Value: rechargeType },
    { Value: rechargeTypeDesc },
    { Value: rechargeAssessmentReq },
    { Value: taxCode },
    { Value: validFrom },
    { Value: validTo },
    { Value: comment }
  ],

   UI.SelectionFields: [
    rechargeTypeId,
    version,
    validFrom,
    validTo,
    rechargeAssessmentReq,
    taxCode
  ]
 
 
);

annotate service.RechargeType with {
  rechargeTypeId        @Common.Label : 'Recharge Type ID';
  version               @Common.Label : 'Version';
  rechargeType          @Common.Label : 'Recharge Type';
  rechargeTypeDesc      @Common.Label : 'Recharge Type Description';
  rechargeAssessmentReq @Common.Label : 'Assessment Required';
  taxCode               @Common.Label : 'Tax Code';
  validFrom             @Common.Label : 'Valid From';
  validTo               @Common.Label : 'Valid To';
  comment               @Common.Label : 'Comment';
};


