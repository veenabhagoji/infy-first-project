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

            if (typeof XLSX === "undefined") {
              jQuery.sap.includeScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", "XLSX");
          }
         
          
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
        
            if (!this._oMassUploadDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.roche.rgsficntrechargedefinition.view.fragment.MassUploadDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oMassUploadDialog = oDialog; // Store the dialog instance
                    oView.addDependent(oDialog);
                    oDialog.open(); 
                    
                }.bind(this));
            } else {
                this._oMassUploadDialog.open(); // Reuse the dialog instance
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
        },

        onFileChange: function (oEvent) {
          const file = oEvent.getParameter("files")?.[0];
      
          if (!file) {
              MessageToast.show("Please select a valid Excel file.");
              return;
          }
      
          this.fileName = file.name;
          console.log("File selected:", this.fileName);
      
          const reader = new FileReader();

        
      
          reader.onload = (e) => {
              const binaryData = e.target.result;
      
              try {
                  const workbook = XLSX.read(binaryData, { type: "binary" });
                  const sheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[sheetName];
                  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
                  console.log("Parsed Excel:", jsonData);
      
                  if (!jsonData || jsonData.length === 0) {
                      MessageBox.warning("Excel file is empty or invalid format.");
                      return;
                  }
      
                  this._uploadedExcelData = jsonData;
                  this._uploadedExcelData = this._uploadedExcelData.map(row => {
                    return {
                        rechargeTypeId: row["ID"]?.toString().trim(),
                        version: row["Version"]?.toString().padStart(2, "0"),
                        rechargeType: row["Recharge Type"]?.toString().trim(),
                        rechargeTypeDesc: row["Recharge Type Desc"]?.toString().trim(),
                        rechargeAssessmentReq: this._parseBoolean(row["Assessment Req"]),
                        taxCode: row["Tax Code"]?.toString().trim(),
                        validFrom: this._formatDate(row["Valid From"]),
                        validTo: this._formatDate(row["Valid To"]),
                        comment: row["Comment"]?.toString().trim()
                    };
                });
                  //MessageToast.show("Excel loaded. Ready to upload.");
              } catch (err) {
                  MessageBox.error("Excel parsing failed: " + err.message);
                  console.error(err);
              }
          };
      
          reader.readAsBinaryString(file);
      },


      onUploadFile: async function () {
        const oModel = this.getView().getModel("catalogService"); 
        let aRechargeTypes =  this._uploadedExcelData;
       
        //   {
        //     "rechargeTypeId": "RT001",
        //     "version": "01",
        //     "rechargeType": "R&D Cost",
        //     "rechargeTypeDesc": "Research and Development Recharge",
        //     "rechargeAssessmentReq": true,
        //     "taxCode": "TX001",
        //     "validFrom": "2025-01-01",
        //     "validTo": "2025-12-31"
        //   },
        //   {
        //     "rechargeTypeId": "RT002",
        //     "version": "01",
        //     "rechargeType": "Marketing Expense",
        //     "rechargeTypeDesc": "Marketing and Advertising Recharge",
        //     "rechargeAssessmentReq": false,
        //     "taxCode": "TX002",
        //     "validFrom": "2025-01-01",
        //     "validTo": "2025-12-31"
        //   }
        // ];

        if (!aRechargeTypes || aRechargeTypes.length === 0) {
            MessageBox.warning("No data available to upload.");
            return;
        }
    
        try {
            
            const oContext = oModel.bindContext(
                "/MassUploadRechargeTypes(...)", 
                null
            );
    
            
            oContext.setParameter("rechargeTypes", aRechargeTypes);
    
            
                await oContext.execute();
    
            
          const oResult = oContext.getBoundContext().getObject();
    
            if (oResult?.success) {
              MessageBox.success(`Upload successful! ${oResult.count} records uploaded.`);
                this._uploadedExcelData = [];

                if (this._oPreviewDialog) {
                  this._oPreviewDialog.close();
                }

                if (this._oMassUploadDialog) {
                  this._oMassUploadDialog.close();
              }

   const oTable = this.byId("id_RC_Main_Tbl_Main"); // Replace with your actual table ID
    if (oTable) {
        const oBinding = oTable.getBinding("items");
        if (oBinding) {
            oBinding.refresh();
        }
    }

            } else {
                MessageBox.error("Upload failed: Backend returned error.");
            }
    
        } catch (error) {
            MessageBox.error("Upload failed: " + error.message);
            console.error("Upload error:", error);

        }
    },
    _parseBoolean: function (value) {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
          return value.trim().toLowerCase() === "true" || value.trim().toLowerCase() === "yes";
      }
      return false;
  },
  _formatDate: function (input) {
    if (!input) return null;
    const date = new Date(input);
    return isNaN(date) ? null : date.toISOString().split("T")[0];
},
    
onPreview: function () {
  const oView = this.getView();
  const oData = this._uploadedExcelData; 

  if (!oData || oData.length === 0) {
      MessageBox.warning("No data available to preview.");
      return;
  }

  // 1. Create JSONModel and set data
  const oPreviewModel = new sap.ui.model.json.JSONModel(oData);
  oView.setModel(oPreviewModel, "previewModel"); // Set named model to the view
  let buttons = [];
  // 2. Load and open the dialog
  if (!this._oPreviewDialog) {
      Fragment.load({
          id: oView.getId(),
          name: "com.roche.rgsficntrechargedefinition.view.fragment.PreviewDialog", // Change this to your actual fragment path
          controller: this
      }).then(oDialog => {
          this._oPreviewDialog = oDialog;
          oView.addDependent(this._oPreviewDialog);
          buttons = this._oPreviewDialog.getButtons();
          buttons[0].setVisible(fasle);
          buttons[1].setVisible(true);
          buttons[2].setVisible(fasle);
          this._oPreviewDialog.open();
      });
  } else {
      this._oPreviewDialog.open();
      buttons = this._oPreviewDialog.getButtons();
      buttons[0].setVisible(fasle);
      buttons[1].setVisible(true);
      buttons[2].setVisible(false);
  }
},

onConfirmUpload: function () {
  // Close the preview dialog
  if (this._oPreviewDialog) {
      this._oPreviewDialog.close();
  }

  // Now call your upload function
  this.onUploadFile();
},

onClosePreviewDialog: function () {
  if (this._oPreviewDialog) {
      this._oPreviewDialog.close();
  }
},

onUpload: function () {
  const oView = this.getView();
  const oData = this._uploadedExcelData; 

  if (!oData || oData.length === 0) {
      MessageBox.warning("No data available to preview.");
      return;
  }

  // 1. Create JSONModel and set data
  const oPreviewModel = new sap.ui.model.json.JSONModel(oData);
  oView.setModel(oPreviewModel, "previewModel"); // Set named model to the view
  let buttons = [];
  // 2. Load and open the dialog
  if (!this._oPreviewDialog) {
      Fragment.load({
          id: oView.getId(),
          name: "com.roche.rgsficntrechargedefinition.view.fragment.PreviewDialog", // Change this to your actual fragment path
          controller: this
      }).then(oDialog => {
          this._oPreviewDialog = oDialog;
          oView.addDependent(this._oPreviewDialog);
          buttons = this._oPreviewDialog.getButtons();
          buttons[0].setVisible(true);
          buttons[1].setVisible(false);
          buttons[2].setVisible(true);
          this._oPreviewDialog.open();
      });
  } else {
      this._oPreviewDialog.open();
      buttons = this._oPreviewDialog.getButtons();
      buttons[0].setVisible(true);
      buttons[1].setVisible(false);
      buttons[2].setVisible(true);
  }
},

          
        
    });
});