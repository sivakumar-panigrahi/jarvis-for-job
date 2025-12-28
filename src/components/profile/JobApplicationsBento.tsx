import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Briefcase, Clock, Building2, TrendingUp, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { missionMessages } from '@/lib/hero-quotes';

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  applied_at: string;
}

interface JobApplicationsBentoProps {
  applications: JobApplication[];
  loading: boolean;
}

export function JobApplicationsBento({ applications, loading }: JobApplicationsBentoProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">No missions logged yet</p>
        <p className="text-sm mt-1">Accept missions from the dashboard to track them here</p>
      </div>
    );
  }

  const totalApplied = applications.length;
  // Daily goals instead of weekly
  const todayCount = applications.filter(app => isToday(new Date(app.applied_at))).length;
  const dailyGoal = 3;
  const latestApp = applications[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BentoCard className="md:col-span-2 lg:col-span-1" status="Live" statusColor="text-success">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-repulsor">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Mission Stats</h3>
        <p className="text-3xl font-bold text-primary mt-1">{totalApplied}</p>
        <p className="text-sm text-muted-foreground mt-2">Total missions • {todayCount} today</p>
        <div className="flex gap-2 mt-4">
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">#Avenger</span>
          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">#Progress</span>
        </div>
      </BentoCard>

      {latestApp && (
        <BentoCard status="Latest" statusColor="text-arc-blue">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-arc-blue/20 border border-arc-blue/30 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-arc-blue" />
            </div>
          </div>
          <h3 className="text-lg font-semibold truncate">{latestApp.company_name}</h3>
          <p className="text-sm text-muted-foreground truncate">{latestApp.job_title}</p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(latestApp.applied_at), { addSuffix: true })}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="px-2 py-1 text-xs rounded-full bg-arc-blue/10 text-arc-blue border border-arc-blue/20">#Recent</span>
          </div>
        </BentoCard>
      )}

      <BentoCard status="Active" statusColor="text-warning">
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-warning/20 border border-warning/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-warning" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">{missionMessages.dailyGoal}</h3>
        <p className="text-sm text-muted-foreground">
          {todayCount >= dailyGoal ? missionMessages.goalAchieved : `${todayCount}/${dailyGoal} missions today`}
        </p>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-warning to-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min((todayCount / dailyGoal) * 100, 100)}%` }}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <span className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning border border-warning/20">#Daily</span>
        </div>
      </BentoCard>

      {/* Application List Cards */}
      {applications.slice(0, 6).map((app, index) => (
        <BentoCard 
          key={app.id}
          status={index === 0 ? "New" : "Applied"}
          statusColor={index === 0 ? "text-emerald-500" : "text-muted-foreground"}
          className={index === 0 ? "md:col-span-2 lg:col-span-1" : ""}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold truncate">{app.company_name}</h3>
          <p className="text-sm text-muted-foreground truncate">{app.job_title}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(app.applied_at), 'PPP')}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              #{app.company_name.split(' ')[0]}
            </span>
          </div>
        </BentoCard>
      ))}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  status?: string;
  statusColor?: string;
}

function BentoCard({ children, className, status, statusColor = "text-muted-foreground" }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative p-5 rounded-2xl",
        "bg-card/50 backdrop-blur-sm border border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-1 transition-all duration-300 ease-out",
        "cursor-default",
        className
      )}
    >
      {/* Status badge */}
      {status && (
        <div className="absolute top-4 right-4">
          <span className={cn("text-xs font-medium", statusColor)}>
            {status}
          </span>
        </div>
      )}
      
      {/* Hover gradient effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
