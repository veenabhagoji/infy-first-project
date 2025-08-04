sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment", 
    "sap/m/MessageToast",    
    "sap/m/MessageBox",      
    "sap/ui/model/Filter",   
    "sap/ui/model/FilterOperator"
   
], (Controller, Spreadsheet,JSONModel, Fragment, MessageToast, MessageBox, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("com.roche.rgsficntrechargedefinition.controller.Recharge", {
        onInit() {
            this.formatter = this.getOwnerComponent().formatter;

            this.getView().setModel(new sap.ui.model.json.JSONModel(), "newRecharge");


         
        },

      
     
        onRowPress: function (oEvent) {
            const oCtx = oEvent.getParameter("listItem").getBindingContext();
            if (!oCtx) {
              console.warn("No binding context found");
              return;
            }
          
            const rechargeTypeId = oCtx.getProperty("rechargeTypeId");
            const version = oCtx.getProperty("version");
          
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("detail", {
              rechargeTypeId,
              version,
              layout: sap.f.LayoutType.TwoColumnsBeginExpanded
            });
          },
          onCreatePress: function () {
            const oView = this.getView();
          
            // Reset the model
            const oModel = oView.getModel("newRecharge");
            oModel.setData({
              
              rechargeType: "",
              rechargeTypeDesc: "",
              rechargeAssessmentReq: false,
              taxCode: "",
              validFrom: null,
              validTo: null,
              comment: ""
            });
          
            if (!this._oDialog) {
              Fragment.load({
                name: "com.roche.rgsficntrechargedefinition.view.fragment.RechargeCreateDialog",
                controller: this
              }).then(function (oDialog) {
                this._oDialog = oDialog;
                oView.addDependent(this._oDialog);
                this._oDialog.open();
              }.bind(this));
            } else {
              this._oDialog.open();
            }
          },
          
          onSaveRecharge: function () { 
            const oData = this.getView().getModel("newRecharge").getData();
          
          //  Add validation logic if needed
            if (!oData.rechargeType || !oData.taxCode) {
              MessageBox.warning("Please fill required fields.");
              return;
            }

            oData.rechargeTypeId = "00";
            oData.version = "00";
            
          const oModel=this.getOwnerComponent().getModel();
            oModel.create("/RechargeType", oData, {
                success: () => {
                    MessageToast.show("Recharge Type Created");
                    this._oDialog.close();
                    oModel.refresh(); // refresh list/table
                    this._oDialog.close();
                },
                error: (oError) => {
                    MessageBox.error("Creation failed");
                    console.error(oError);
                }
            });
            // Post logic here (OData.create, batch, etc.)
          
          
           
          },
          
          onCancelRecharge: function () {
            this._oDialog.close();
          },

          onMassUploadPress: function () {
            var oView = this.getView();
      
            // Load dialog fragment only once
            if (!this.pMassUploaderDialog) {
              this.pMassUploaderDialog = Fragment.load({
                id: oView.getId(),
                name: "com.roche.rgsficntrechargedefinition.view.fragment.MassUploadDialog",
                controller: this
              }).then(function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
              });
            } else {
              this.pMassUploaderDialog.then(function (oDialog) {
                oDialog.open();
              });
            }
          },
      
          onCloseMassUploaderDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
          },
      
         
        onDownloadExcel: function () {
            var oSmartTable = this.byId("smartTable");
            var oTable = oSmartTable.getTable(); // your sap.m.Table
            var oBinding = oTable.getBinding("items");
        
            if (!oBinding) {
                MessageToast.show("No data to export.");
                return;
            }
        
            var aData = oBinding.getContexts(0, oBinding.getLength()).map(function (oContext) {
                return oContext.getObject();
            });
        
            var aCols = this._createColumnConfig();
        
            var oSettings = {
                workbook: {
                    columns: aCols
                },
                dataSource: aData,
                fileName: "RechargeTypes.xlsx",
                worker: false
            };
        
            new Spreadsheet(oSettings).build()
                .then(function () {
                    MessageToast.show("Excel export done");
                })
                .catch(function (oError) {
                    console.error("Export failed", oError);
                });
        },

        _createColumnConfig: function () {
            return [
                { label: "ID", property: "rechargeTypeId", type: "string" },
                { label: "Version", property: "version", type: "string" },
                { label: "Recharge Type", property: "rechargeType", type: "string" },
                { label: "Recharge Type Desc", property: "rechargeTypeDesc", type: "string" },
                { label: "Assessment Req", property: "rechargeAssessmentReq", type: "boolean" },
                { label: "Tax Code", property: "taxCode", type: "string" },
                { label: "Valid From", property: "validFrom", type: "date" },
                { label: "Valid To", property: "validTo", type: "date" },
                { label: "Comment", property: "comment", type: "string" }
            ];
        }
        
        

         
       
        
        
        
        

          
          
        
    });
});