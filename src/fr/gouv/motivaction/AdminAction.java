package fr.gouv.motivaction;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.dao.AdminDAO;
import fr.gouv.motivaction.mails.DailyAlert;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.mails.WeeklyReport;
import fr.gouv.motivaction.model.UserActivity;
import fr.gouv.motivaction.model.UserInterview;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.service.AdminService;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.SlackService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;


@Path("/admin")
public class AdminAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "003";

    //public static Timer metricAdminActionTimer = Utils.metricRegistry.timer("metricAdminActionTimer");
    
    // retourne le nombre d'utilisateurs total
    @GET
    @Path("userCount")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserCount(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long userCount = AdminService.getUserCount(cohorte);

                res = "{ \"result\" : \"ok\", \"userCount\" : " + userCount+ " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-001 Error getting user count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-002 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre total de candidature
    @GET
    @Path("candidatureCount")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureCount(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long candidatureCount = AdminService.getCandidatureCount(cohorte);

                res = "{ \"result\" : \"ok\", \"candidatureCount\" : " + candidatureCount+ " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-003 Error getting candidature count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-004 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre de candidature par utilisateur
    @GET
    @Path("candidaturePerUser")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidaturePerUser(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                double candidaturePerUser = AdminService.getCandidaturePerUser(cohorte);

                res = "{ \"result\" : \"ok\", \"candidaturePerUser\" : " + candidaturePerUser + " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-005 Error getting candidaturePerUser. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-006 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre de candidature par utilisateur
    @GET
    @Path("candidatureAndUserCount/{d}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureAndUserCount(@Context HttpServletRequest servletRequest,@PathParam("d")int d)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long [] counts = AdminService.getCandidatureAndUserCount(d,cohorte);

                res = "{ \"result\" : \"ok\", \"userCount\" : " + counts[0]+ ", \"candidatureCount\" : "+ counts[1]+" }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-007 Error getting candidature and user count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-008 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des candidatures de l'utilisateur
    @GET
    @Path("activities/{userId}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserActions(@Context HttpServletRequest servletRequest,@PathParam("userId")long userId)
    {
        String res;
        long adminUserId = UserService.checkAdminUserAuth(servletRequest);
        if(adminUserId>0)
        {
            try
            {
                Object [] actions = (Object [])AdminService.getUserActions(userId);

                String action = "[";
                for(int i=0; i<actions.length; ++i)
                {
                    if(i>0)
                        action+=",";
                    action+= Utils.gson.toJson((UserLog)actions[i]);
                }
                action +="]";

                String vLink = UserService.getVisitorLinkForUser(userId);

                res = "{ \"result\" : \"ok\", \"visitorLink\" : \""+vLink+"\", \"actions\" : " + action + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-013 Error getting user actions. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-014 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des candidatures de l'utilisateur
    @GET
    @Path("getUserActivities")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserActivities(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                String email = servletRequest.getParameter("email");

                Object [] activities = null;


                if(email==null) {
                    activities = (Object[]) AdminService.getUserActivities(cohorte, "50");
                }
                else
                {
                    activities = (Object[]) AdminService.getUserActivities(email);
                }

                String activity = "[";
                for(int i=0; i<activities.length; ++i)
                {
                    if(i>0)
                        activity+=",";
                    activity+= Utils.gson.toJson((UserActivity)activities[i]);
                }
                activity +="]";

                res = "{ \"result\" : \"ok\", \"activities\" : " + activity + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-009 Error getting user activities. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-010 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des entretiens et utilisateurs
    @GET
    @Path("userInterviews")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserInterviews(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                Object [] interviews = (Object [])AdminService.getUserInterviews(cohorte);

                String interview = "[";
                for(int i=0; i<interviews.length; ++i)
                {
                    if(i>0)
                        interview+=",";
                    interview+= Utils.gson.toJson((UserInterview)interviews[i]);
                }
                interview +="]";

                res = "{ \"result\" : \"ok\", \"interviews\" : " + interview + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-015 Error getting user interviews. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-016 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // envoie un email avec le compte rendu hebdo de l'utilisateur aux admins de MEMO
    @POST
    @Path("sendWeeklyEmailReminder/{userId}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String sendWeeklyEmailReminder(@Context HttpServletRequest servletRequest, @PathParam("userId")long userId)
    {
        String res;
        long adminUserId = UserService.checkAdminUserAuth(servletRequest);

        if(adminUserId>0)
        {
            try
            {
            	// Mail du weekly report
            	WeeklyReport weekReport = new WeeklyReport();
            	weekReport.buildAndSendWeeklyTaskReminder(userId);
            	// Mail du daily report
                DailyAlert dailyAlert = new DailyAlert();
                dailyAlert.buildAndSendWeeklyTaskReminderNoCandidature(userId);

                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-011 Error sending weekly reminder report. userId="+userId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-012 Unauthentified trial to use admin feature.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne un extract CSV des activités des utilisateurs
    @GET
    @Path("getExtractUserActivities")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getExtractUserActivities(@Context HttpServletRequest servletRequest)
    {
        String res;
        boolean isExtract = false;
        long nbUser = 0;
        long userId = UserService.checkAdminUserAuth(servletRequest);
        
        if(userId>0)
        {
            try
            {
            	nbUser = AdminService.getUserCount(null);
            	isExtract = AdminService.getExtractUserActivities(nbUser);
            	if (isExtract) {
	                res = "{ \"result\" : \"ok\" }";
            	} else {
            		log.error(logCode + "-017 Error getting user activities.");
                    res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            	}
            }
            catch (Exception e)
            {
                log.error(logCode + "-017 Error getting user activities. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-018 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    @GET
    @Path("healthCheck")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getHealthCheck(@Context HttpServletRequest servletRequest)
    {
        String res;
        String healthCheck = null;
        
        try {
        	healthCheck = AdminService.getHealthCheck();
        } catch(Exception e){
        	healthCheck = "Service JAVA KO : " + e;
        	log.error(logCode + "-019 Error Action getting healthCheck. error=" + Utils.getStackTraceIntoString(e));
        }
        
        if (healthCheck==null)
    		res = "{ \"result\" : \"ok\" }";
    	else {
    		res = "{ \"result\" : \"error\", \"msg\" : \" " + healthCheck + " \" }";
    	}
        return res;
    }
    
    @GET
    @Path("reportErrorHealthCheck/{errorMsg}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String reportErrorHealthCheck(@Context HttpServletRequest servletRequest, @PathParam("errorMsg")String errorMsg)
    {
    	String res;
    	
    	try {
	    	// Notification ds Slack
			SlackService.sendMsg("HealthCheck KO ! " + errorMsg);
			// Envoie d'un email d'alerte
			MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Alerte " + MailTools.env + " - HealthCheck KO", "");
			res = "{ \"result\" : \"ok\" }";
    	} catch(Exception e) {
    		res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
    	}		
		return res;
    }
    
    @GET
    @Path("quartz")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getQuartzInfo(@Context HttpServletRequest servletRequest) {
    	String res;
    	try {
        	
			res = "{ \"result\" : \"ok\", \"hostname\" : \"" + MailTools.getHostname() + "\", \"hostQuartz\" : \"" + MailTools.hostQuartzRun + "\", \"quartzIsRunning\" : \"" + MailTools.getQuartzRunning() + "\" }";
    	} catch(Exception e) {
    		res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
    	}		
		return res;
    }

}
