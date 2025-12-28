import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears } from 'date-fns';
import {
  Loader2, User, Phone, Github, ArrowLeft, CalendarIcon,
  CheckCircle2, GraduationCap, Building2, Save
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

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
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

  const calculatedAge = useMemo(() => {
    if (!watchDob) return null;
    return differenceInYears(new Date(), watchDob);
  }, [watchDob]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
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
  }, [profile, form]);

  const handleResumeUpload = (url: string) => {
    setResumeUrl(url);
    // Removed immediate Supabase update to prevent data wiping
    toast({
      title: 'Resume uploaded',
      description: 'Click "Save Changes" to update your profile.',
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

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
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved.',
      });

      navigate('/profile', { replace: true });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8">
      <AuthBackground />

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl animate-slide-up">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information</p>
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
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  Phone Number
                  <span className="text-destructive">*</span>
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

            {/* Education Section */}
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
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Department
                  <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
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
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Qualification
                  <span className="text-destructive">*</span>
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
                        <Label htmlFor="ug" className="cursor-pointer">
                          Undergraduate (UG)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PG" id="pg" />
                        <Label htmlFor="pg" className="cursor-pointer">
                          Postgraduate (PG)
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Year of Passout & Percentage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Year of Passout
                    <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={form.control}
                    name="year_of_passout"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduation_percentage" className="flex items-center gap-2">
                    Graduation %
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="graduation_percentage"
                    type="number"
                    step="0.01"
                    placeholder="85.5"
                    {...form.register('graduation_percentage', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            {/* Skills & Resume Section */}
            <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Github className="h-4 w-4" />
                Skills & Links
              </h3>

              {/* GitHub URL */}
              <div className="space-y-2">
                <Label htmlFor="github_url" className="flex items-center gap-2">
                  GitHub Profile URL
                </Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="github_url"
                    placeholder="https://github.com/username"
                    className="pl-10"
                    {...form.register('github_url')}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Skills
                  <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <SkillsInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">Resume</Label>
                {user && (
                  <ResumeUpload
                    userId={user.id}
                    currentResumeUrl={resumeUrl}
                    onUploadComplete={handleResumeUpload}
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isLoading || !form.formState.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}