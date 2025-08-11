sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("com.roche.rgsficntrechargedefinition.controller.Detail", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
      },
  
      _onObjectMatched: function (oEvent) {
        const oAppModel = this.getOwnerComponent().getModel("globalStorage");

    
        oAppModel.setProperty("/layout", "TwoColumnsBeginExpanded");
        const sRechargeTypeId = oEvent.getParameter("arguments").rechargeTypeId;
        const sVersion = oEvent.getParameter("arguments").version;
      
        const sPath = `/RechargeType(rechargeTypeId='${sRechargeTypeId}',version='${sVersion}')`;
        this.getView().bindElement(sPath);
      },
      onBackToMain: function () {
        
        const oFCL = this.getOwnerComponent().getRootControl().byId("flexibleColumnLayout");
    
        
        oFCL.setLayout("OneColumn");
    
        
        this.getOwnerComponent().getRouter().navTo("Recharge");
    }
    
      
      
    });
  });
  