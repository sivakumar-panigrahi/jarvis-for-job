import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import {
  Loader2, User, Phone, Github, ArrowRight, CalendarIcon,
  CheckCircle2, Shield, GraduationCap, Building2, Percent, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { SkillsInput } from '@/components/profile/SkillsInput';
import { ResumeUpload } from '@/components/profile/ResumeUpload';
import { ProfileCompleteVideo } from '@/components/profile/ProfileCompleteVideo';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const DEPARTMENTS = [
  'CSE',
  'EEE',
  'Data Science',
  'Civil',
  'Mechanical',
  'Others',
] as const;

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - 15 + i);

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  date_of_birth: z.date({ required_error: 'Date of birth is required' }),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  github_url: z
    .string()
    .url('Please enter a valid URL')
    .regex(/github\.com/, 'Must be a GitHub profile URL')
    .or(z.literal('')),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  college_name: z.string().min(2, 'College name is required').max(200),
  department: z.string().min(1, 'Please select a department'),
  qualification: z.enum(['UG', 'PG'], { required_error: 'Please select qualification' }),
  graduation_percentage: z.number({ invalid_type_error: "Required" }).min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100'),
  year_of_passout: z.number({ invalid_type_error: "Required" }).min(1980).max(currentYear + 10),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [showBatmanVideo, setShowBatmanVideo] = useState(false);
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      phone: '',
      github_url: '',
      skills: [],
      college_name: '',
      department: '',
      qualification: undefined,
      graduation_percentage: undefined,
      year_of_passout: undefined,
    },
  });

  const watchDob = form.watch('date_of_birth');
  const watchAllFields = form.watch();

  const calculatedAge = useMemo(() => {
    if (!watchDob) return null;
    return differenceInYears(new Date(), watchDob);
  }, [watchDob]);

  const completionProgress = useMemo(() => {
    const totalFields = 10;
    let completed = 0;

    if (watchAllFields.full_name?.length >= 2) completed++;
    if (watchAllFields.date_of_birth) completed++;
    if (watchAllFields.phone?.length >= 10) completed++;
    if (watchAllFields.skills?.length >= 1) completed++;
    if (watchAllFields.college_name?.length >= 2) completed++;
    if (watchAllFields.department) completed++;
    if (watchAllFields.qualification) completed++;
    // Check for valid numbers (not NaN)
    if (watchAllFields.graduation_percentage !== undefined && !isNaN(watchAllFields.graduation_percentage)) completed++;
    if (watchAllFields.year_of_passout && !isNaN(watchAllFields.year_of_passout)) completed++;
    if (resumeUrl) completed++;

    return Math.min(100, (completed / totalFields) * 100);
  }, [watchAllFields, resumeUrl]);

  const isFormValid = form.formState.isValid;
  const isReadyToSubmit = isFormValid && !!resumeUrl;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (profile?.profile_completed) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  // Pre-fill form if profile data exists
  useEffect(() => {
    if (profile) {
      // We only reset if the form isn't dirty to avoid overwriting user input during edits
      // But for initial load, we populate.
      const currentValues = form.getValues();
      const isClean = !form.formState.isDirty;

      if (isClean) {
        form.reset({
          full_name: profile.full_name || '',
          date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
          phone: profile.phone || '',
          github_url: profile.github_url || '',
          skills: profile.skills || [],
          college_name: profile.college_name || '',
          department: profile.department || '',
          qualification: profile.qualification as 'UG' | 'PG' | undefined,
          graduation_percentage: profile.graduation_percentage ?? undefined,
          year_of_passout: profile.year_of_passout ?? undefined,
        });
        setResumeUrl(profile.resume_url || null);
      }
    }
  }, [profile, form]);

  const handleResumeUpload = (url: string) => {
    // Only update local state, do not trigger DB update yet
    setResumeUrl(url);
    toast({
      title: 'Resume uploaded',
      description: 'Continue filling the form and submit to save.',
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    if (!resumeUrl) {
      toast({
        variant: 'destructive',
        title: 'Resume missing',
        description: 'Please upload your resume before continuing.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          date_of_birth: format(data.date_of_birth, 'yyyy-MM-dd'),
          phone: data.phone,
          github_url: data.github_url || null,
          skills: data.skills,
          college_name: data.college_name,
          department: data.department,
          qualification: data.qualification,
          graduation_percentage: data.graduation_percentage,
          year_of_passout: data.year_of_passout,
          resume_url: resumeUrl,
          profile_completed: true,
          is_first_login: false,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Profile completed!',
        description: 'Welcome to Gotham.',
      });

      setShowBatmanVideo(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showBatmanVideo) {
    return (
      <ProfileCompleteVideo
        onComplete={() => navigate('/dashboard', { replace: true })}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <AuthBackground />

      {/* Logo */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-effect">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-bold gradient-text">JobTracker</span>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-3xl shadow-xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Personal details for <span className="text-primary">@{profile?.username}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Profile completion</span>
            <span className="font-medium text-primary">{Math.round(completionProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${completionProgress}%` }}
            />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                Full Name
                <span className="text-destructive">*</span>
                {form.formState.dirtyFields.full_name && !form.formState.errors.full_name && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                {...form.register('full_name')}
                className={cn(
                  form.formState.errors.full_name && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Date of Birth
                <span className="text-destructive">*</span>
                {watchDob && <CheckCircle2 className="h-4 w-4 text-success" />}
              </Label>
              <Controller
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                          form.formState.errors.date_of_birth && 'border-destructive'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : 'Select your birth date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1940-01-01')
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                        captionLayout="dropdown"
                        fromYear={1940}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {calculatedAge !== null && (
                <p className="text-sm text-primary font-medium">
                  Age: {calculatedAge} years old
                </p>
              )}
              {form.formState.errors.date_of_birth && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.date_of_birth.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                Phone Number
                <span className="text-destructive">*</span>
                {form.formState.dirtyFields.phone && !form.formState.errors.phone && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className={cn(
                    'pl-10',
                    form.formState.errors.phone && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...form.register('phone')}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Education Info Section */}
          <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education Details
            </h3>

            {/* College Name */}
            <div className="space-y-2">
              <Label htmlFor="college_name" className="flex items-center gap-2">
                College Name
                <span className="text-destructive">*</span>
                {form.formState.dirtyFields.college_name && !form.formState.errors.college_name && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="college_name"
                  placeholder="Enter your college name"
                  className={cn(
                    'pl-10',
                    form.formState.errors.college_name && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...form.register('college_name')}
                />
              </div>
              {form.formState.errors.college_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.college_name.message}
                </p>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Department
                <span className="text-destructive">*</span>
                {watchAllFields.department && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <Controller
                control={form.control}
                name="department"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(
                      form.formState.errors.department && 'border-destructive'
                    )}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.department && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.department.message}
                </p>
              )}
            </div>

            {/* Qualification - Radio */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Qualification
                <span className="text-destructive">*</span>
                {watchAllFields.qualification && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <Controller
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="UG" id="ug" />
                      <Label htmlFor="ug" className="font-normal cursor-pointer">
                        UG (Undergraduate)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PG" id="pg" />
                      <Label htmlFor="pg" className="font-normal cursor-pointer">
                        PG (Postgraduate)
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {form.formState.errors.qualification && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.qualification.message}
                </p>
              )}
            </div>

            {/* Graduation Percentage */}
            <div className="space-y-2">
              <Label htmlFor="graduation_percentage" className="flex items-center gap-2">
                Graduation Percentage
                <span className="text-destructive">*</span>
                {watchAllFields.graduation_percentage !== undefined && !isNaN(watchAllFields.graduation_percentage) && !form.formState.errors.graduation_percentage && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="graduation_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="85.50"
                  className={cn(
                    'pl-10',
                    form.formState.errors.graduation_percentage && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...form.register('graduation_percentage', { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.graduation_percentage && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.graduation_percentage.message}
                </p>
              )}
            </div>

            {/* Year of Pass Out */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Year of Pass Out
                <span className="text-destructive">*</span>
                {watchAllFields.year_of_passout && !isNaN(watchAllFields.year_of_passout) && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <Controller
                control={form.control}
                name="year_of_passout"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(parseInt(val))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className={cn(
                      form.formState.errors.year_of_passout && 'border-destructive'
                    )}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.year_of_passout && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.year_of_passout.message}
                </p>
              )}
            </div>
          </div>

          {/* Professional Section */}
          <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Github className="h-4 w-4" />
              Professional Details
            </h3>

            {/* GitHub URL */}
            <div className="space-y-2">
              <Label htmlFor="github_url" className="flex items-center gap-2">
                GitHub Profile
                <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/username"
                  className={cn(
                    'pl-10',
                    form.formState.errors.github_url && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...form.register('github_url')}
                />
              </div>
              {form.formState.errors.github_url && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.github_url.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Skills
                <span className="text-destructive">*</span>
                {watchAllFields.skills?.length >= 1 && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
              </Label>
              <Controller
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <SkillsInput
                    value={field.value || []}
                    onChange={field.onChange}
                    maxSkills={20}
                  />
                )}
              />
              {form.formState.errors.skills && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.skills.message}
                </p>
              )}
            </div>
          </div>

          {/* Resume Upload Section */}
          <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume Upload
              <span className="text-destructive">*</span>
              {resumeUrl && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </h3>

            {user && (
              <ResumeUpload
                userId={user.id}
                currentResumeUrl={resumeUrl}
                onUploadComplete={handleResumeUpload}
              />
            )}
            {!resumeUrl && (
              <p className="text-sm text-destructive mt-2">
                * Resume is required to proceed.
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !isReadyToSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isReadyToSubmit ? 'Continue to Dashboard' : 'Complete all required fields & Upload Resume'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}