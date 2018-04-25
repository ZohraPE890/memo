function Parametres()
{
    this.init();
}

Parametres.prototype = {

    init : function()
    {
        var options = {
                onText : "Oui",
                offText : "Non",
                size: "mini",
                animate : true
        }

        this.receiveEmailForm = $("#receiveEmailForm");
        if(this.receiveEmailForm && this.receiveEmailForm.length)
        	this.receiveEmailForm.bootstrapSwitch(options);
        this.hasChange = 0;

        $("#receiveEmailForm").on("click", $.proxy(this.receiveEmailForm, this));
        $("#modifierMotDePasseButton").on("click", $.proxy(this.openModifierMotDePasse, this));
        $("#modifierEmailButton").on("click", $.proxy(this.openModifierEmail, this));
        $("#supprimerCompteButton").on("click", $.proxy(this.openSupprimerCompte,this));
        $(".parametresFormCancel").on("click", $.proxy(this.cancelParametres, this));
        $(".buttonSaveParametres").on("click",$.proxy(this.saveParametres,this));
        $("#confirmerSupCompteButton").on("click", $.proxy(this.supprimerCompte,this));
        $("#enregistrerMotDePasseButton").on("click", $.proxy(this.modifierMotDePasse,this));
        $("#enregistrerEmailButton").on("click", $.proxy(this.modifierEmail,this));
        $("#extractTDBButton").on("click", $.proxy(this.extractTDB,this));

        // Chargement des champs de saisies de la modal de modif du password
        var fct = function()
        {
            var fNP = lBR.parametres.newPassword,
            	fCNP = lBR.parametres.newConfirmPassword,
                v = fNP.field.val(),
                pear = fNP;
            if(this.id == fNP.id)
                pear = fCNP;
            if(v == "" || v != fCNP.field.val())
            {
                pear.setError();
                return false;
            }
            else
            {
                pear.setOK();
                return true;
            }
        };
        this.lastPassword = new TextField({
            id : 'lastPasswordInput',
            type : 5,
            tag : 'Ancien mot de passe',
            name : 'lastPassword',
            isMetronic : true,
            nulValue : false
        } );
        this.newPassword = new TextField({
            id : 'newPasswordInput',
            type : 5,
            tag : 'Nouveau mot de passe',
            name : 'newPassword',
	        max : 50,
            min : 12,
            isMetronic : true,
            nulValue : false,
            ctrl : fct
        } );
        
        this.newConfirmPassword = new TextField({
            id : 'newConfirmPasswordInput',
            type : 5,
            tag : 'Saisissez le nouveau mot de passe',
            name : 'newConfirmPassword',
	        max : 50,
            min : 12,
            isMetronic : true,
            nulValue : false,
            ctrl : fct
        } );

        this.checkPassword = new TextField({
            id : 'checkPasswordInput',
            type : 5,
            tag : 'Mot de passe',
            name : 'checkPassword',
            isMetronic : true,
            nulValue : false
        } );

        this.newEmailInput = new TextField({
            id : 'newEmailInput',
            type : 4,
            tag : 'Votre nouvel e-mail',
            lTag : 'Votre nouvel e-mail',
            name : 'login',
            isMetronic : true,
            nulValue : false
        } );

    },

    show : function()
    {
    	// l'écran des préférences n'est jamais consulté en archiveMode
    	lBR.board.archiveMode = 0;
    	$("body").removeClass("archives");
    	
    	// elements masqués
    	lBR.hideNewCandidatureButtons();
    	lBR.board.displayQuickImportButton(0);
    	//$("#preferencePage").hide();
        $("#boardPanel").hide();
        $("#createCandidatureForm").hide();

        lBR.displayInnerPage("#parametresPage");

        lBR.showBreadcrumb("parametres");
        
        this.loadParametres();

        this.showPEConnectInfo();
    },

    loadParametres : function()
    {
        $.ajax({
            type: 'GET',
            url: lBR.rootURL + '/account/parametres',
            dataType: "json",

            success: function (response)
            {

                if(response.result=="ok")
                {
                	lBR.parametres.login = response.login;
                    lBR.parametres.receiveEmail = response.receiveEmail;
                    lBR.parametres.setValues();
                }
                else
                {
                	lBR.parametres.disabledModifierParamètres();
                    toastr['error']("Erreur lors du chargement des paramètres","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
            	lBR.parametres.disabledModifierParamètres();
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                toastr['error']("Erreur lors du chargement des abonnements","Une erreur s'est produite "+errorThrown);
                console.log('/account error: ' + textStatus);
                console.log("traitement erreur account");
            }
        });
    },

    disabledModifierParamètres : function() {
    	$("#modifierMotDePasseButton").off("click");
        $("#modifierEmailButton").off("click");
        $("#supprimerCompteButton").off("click");
        $(".buttonSaveParametres").off("click");
    },
    
    setValues : function()
    {
        this.receiveEmailForm.bootstrapSwitch("state",(this.receiveEmail?true:false));
    },

    resetMotDePasseForm : function()
    {
    	$('.alert-danger', $('.motDePasseForm')).hide();
    	
        this.lastPassword.setValue("");
        this.newPassword.setValue("");
        this.newConfirmPassword.setValue("");
    },

    resetModifierEmailForm : function()
    {
        $('.alert-danger', $('.modifierEmailForm')).hide();

        $("#mdModifierEmailPass").show();

        this.newEmailInput.setValue("");
        this.checkPassword.setValue("");
    },
    
    openModifierMotDePasse : function()
    {
        $('#mdRenouvelerMotDePasse').modal('hide'); // ferme la modale de renew pass si c'était la source d'affichage
    	this.resetMotDePasseForm();
    	$('#mdModifierMotDePasse').modal('show');
    },

    openModifierEmail : function()
    {
        this.resetModifierEmailForm();

        if(memoVars && memoVars.user.isPEAM)
            $("#mdModifierEmailPass").hide();

        $('#mdModifierEmail').modal('show');
    },
    
    modifierMotDePasse : function()
    {
    	var  t=this,
    		 err = '',
        	 fieldLastPassword = t.lastPassword,        	 
        	 fieldNewPassword = t.newPassword,
        	 fieldNewConfirmPassword = t.newConfirmPassword, 
        	 ok = 1;
    	
    	// reset du msg d'erreur
    	$("#modifierMotDePasseMsg").html('');
    	
    	if(!fieldLastPassword.check()) {
    		ok = 0;
            err += "Le champ de votre ancien mot de passe ne doit pas être vide.<br />";
        } else {	
        	if(!fieldNewPassword.check()) {
	            ok = 0;
	            err += "Les champs des nouveaux mots de passe doivent comporter au moins 12 caractères et au maximum 50 et doivent contenir la même valeur.<br />";
	        } 
        }
    	
    	 if(ok)
         {
    		 var p = "login=" + memoVars.user.login + "&lastPassword=" + fieldLastPassword.getQParam() + "&newPassword=" + fieldNewPassword.getQParam();
             p += "&csrf="+$("#csrf").val();

		     $.ajax({
		         type: 'POST',
		         url: lBR.rootURL + '/account/newPassword',
		         data: p,
		         dataType: "json",
		
		         success: function (response) {
		        	 if(response.result=="ok") {
		        		 toastr['success']("Mot de passe modifié","");
		        		 $('#mdModifierMotDePasse').modal('hide');
		        	 } else
		        	 {
		        		 lBR.parametres.lastPassword.setError();
		        		 $("#modifierMotDePasseMsg").html("L'ancien mot de passe ne correspond à celui définit actuellement.");
		        		 $('.alert-danger', $('.motDePasseForm')).show();
	                }
		         },
		         error: function (jqXHR, textStatus, errorThrown) {
		             console.log('/account/newPassword: ' + textStatus);
		         }
		     });
         } else {
        	 $("#modifierMotDePasseMsg").html(err);
             $('.alert-danger', $('.motDePasseForm')).show();
             $wST(230);
         }
    },

    modifierEmail : function()
    {
        var  t=this,
            err = '',
            ok = 1;

        // reset du msg d'erreur
        $("#modifierEmailMsg").html('');


        if(!t.checkPassword.check() && (!memoVars.user.isPEAM) )
        {
            ok = 0;
            err += "Le champ mot de passe ne doit pas être vide.<br />";
        }

        if(!t.newEmailInput.check())
        {
            ok = 0;
            err += "Vous devez renseigner une adresse e-mail valide.<br />";
        }

        if(t.newEmailInput.getValue()==memoVars.user.login)
        {
            ok = 0;
            err += "L'adresse e-mail renseignée est identique à votre adresse actuelle.<br />";
        }

        if(ok)
        {
            var p = "login=" + memoVars.user.login + "&password=" + t.checkPassword.getQParam() + "&newEmail=" + t.newEmailInput.getQParam();
            p += "&csrf="+$("#csrf").val();

            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/account/newEmail',
                data: p,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        toastr['success']("Adresse e-mail modifiée","");
                        $('#mdModifierEmail').modal('hide');
                        memoVars.user.login = t.newEmailInput.getValue();
                        lBR.board.setLogin();
                    }
                    else
                    {
                        lBR.parametres.newEmailInput.setError();

                        // gérer les cas d'erreurs
                        if(response.msg=="wrongPassword")
                            err = "Le mot de passe renseigné ne correspond pas";
                        else if(response.msg=="userExists")
                            err = "Cette adresse e-mail est déjà utilisée";
                        else
                            err = "Une erreur technique s'est produite. Veuillez contactez l'équipe MEMO";

                        $("#modifierEmailMsg").html(err);

                        $('.alert-danger', $('.modifierEmailForm')).show();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('/account/newPassword: ' + textStatus);
                }
            });
        } else {
            $("#modifierEmailMsg").html(err);
            $('.alert-danger', $('.modifierEmailForm')).show();
            $wST(230);
        }
    },

    openSupprimerCompte : function(evt)
    {
    	evt.stopPropagation();
    	$('#mdSupprimerCompte').modal('show');
    },
    
    supprimerCompte : function(evt)
    {
        $('#mdSupprimerCompte').modal('hide');

        var p = "csrf="+$("#csrf").val();

    	$.ajax({
            type: 'DELETE',
            data: p,
            url: lBR.rootURL + '/account/mailSupprimerCompte',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Email envoyé à "+response.login,"");
                }
                else
                {
                    toastr['error']("Erreur lors de l'envoi de l'email de suppression de compte","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                toastr['error']("Erreur lors de l'envoi de l'email de suppression de compte","Une erreur s'est produite "+errorThrown);
                console.log('/account/mailSupprimerCompte error: ' + textStatus); 
            }
        });
    },
    
    saveParametres : function()
    {

    	var p = "receiveEmail="+(this.receiveEmailForm.bootstrapSwitch("state")?1:0);

        p += "&csrf="+$("#csrf").val();

        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/account/parametres',
            data: p,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Paramètres enregistrés","");
                }
                else
                {
                    toastr['error']("Erreur lors de l'enregistrement des paramètres","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                toastr['error']("Erreur lors de l'enregistrement des parametres","Une erreur s'est produite "+errorThrown);
                console.log('/account parametres error: ' + textStatus);
                console.log("traitement erreur account parametres");
            }
        });

    },
    
    cancelParametres : function(h)
    {
        if(this.hasChange)
        {
            this.afterChangeSave = "showParametres";
            this.showUnsavedModal();
        }
        else
        {
            if (h != 1) {
            	$Hist({id: "activeCandidatures"});
            }

            if (!memoVars.isVisitor) {
            	lBR.showNewCandidatureButtons();
            	lBR.board.displayQuickImportButton(1);
            }
            
            $("#parametresPage").hide();
            $("#boardPanel").show();

            lBR.refreshMenu($("#activeButton")); // on désactive les lien tableau de bord dans le menu
            
            lBR.board.buildCandidatures();

            lBR.board.selectedCandidature = null;
            
            $wST(0);
        }
    },

    showPEConnectInfo : function()
    {
        var u = memoVars.user, info="", infoBlock = $("#userInfo"), pwdBlock = $("#changePasswordBlock");
        if(u.isPEAM)
        {
            pwdBlock.hide();
            info+="<label>Identité : </label>"+ u.firstName+" "+ u.lastName+"<br />";
            if(u.login)
                info+="<label>Adresse e-mail : </label>"+ u.login+"<br />";
            if(u.address)
            {
                info+="<label>Adresse : </label><br />"+ Url.decode(u.address)+"<br />";
                if(u.zip)
                    info+= u.zip+" ";
                if(u.city)
                    info+= u.city+"<br />";
                if(u.country)
                    info+= u.country+"<br />"
            }

            $("#userInfo > div").first().html(info);

            infoBlock.show();
        }
        else
        {
            infoBlock.hide();
            pwdBlock.show();
            this.clearUserInfo();
        }
    },

    clearUserInfo : function()
    {
        $("#userInfo > div").first().text("");
    },
    
    extractTDB : function()
    {
    	lBR.logEventToGA('event', 'Utilisateur', 'extractTDB', 'extract TDB');    	

        $.ajax({
            type: 'GET',
            url: lBR.rootURL + '/account/extractTDB',
            dataType: "json",

            success: function (response) {
                if(response.result=="ok" && response.userId) {
                	var element = document.createElement('a');
               	 	element.setAttribute('href', "./tmp/extractTDB-"+response.userId+".csv");
               	 	element.setAttribute('download', "extractTDB-"+response.userId+".csv");
               	 	element.style.display = 'none';
               	 	document.body.appendChild(element);
               	 	element.click();
               	 	document.body.removeChild(element);
                } else {
                	toastr['error']("Erreur lors du chargement getExtractUserActivities","Une erreur s'est produite "+response.msg);
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('/account/extractTDB error: ' + textStatus);
            }
        });
    }
}
