/**
 * AstraSpin Admin Panel - Router v11
 */
(function(global){
'use strict';

var Router = {
    init:function(){
        this.attachListeners();
    },

    attachListeners:function(){
        var self=this;

        document.addEventListener('click',function(e){
            var btn=e.target.closest('[data-page]');
            if(!btn) return;

            e.preventDefault();

            self.navigate(btn.getAttribute('data-page'));
        });
    },

    navigate:function(page){

        if(!global.AdminModules){
            alert("AdminModules not found");
            return;
        }

        console.log('PAGE =', page);\n        console.log('MODULES =', Object.keys(global.AdminModules));\n\n        var module=global.AdminModules[page];

        if(!module){
            alert("Module '"+page+"' not found");
            return;
        }

        try{

            module.init();

        }catch(err){

            alert(
                "Module : "+page+
                "\n\nError : "+err.message+
                "\n\n"+err.stack
            );

            console.error(err);
        }

    }
};

global.AdminRouter=Router;

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",function(){
        Router.init();
    });
}else{
    Router.init();
}

})(window);
