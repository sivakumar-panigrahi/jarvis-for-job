import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const suggestedSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'CSS', 'HTML', 'SQL', 'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL',
  'Next.js', 'Vue.js', 'Angular', 'GraphQL', 'REST API', 'Figma',
];

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export function SkillsInput({ value, onChange, maxSkills = 40 }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(skill)
  );

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !value.includes(trimmedSkill) && value.length < maxSkills) {
      onChange([...value, trimmedSkill]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Skills tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxSkills ? `Maximum ${maxSkills} skills reached` : 'Type a skill and press Enter'}
          disabled={value.length >= maxSkills}
          className={cn(value.length >= maxSkills && 'opacity-50 cursor-not-allowed')}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 6).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick add suggestions */}
      {value.length < maxSkills && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Quick add:</span>
          {suggestedSkills
            .filter((skill) => !value.includes(skill))
            .slice(0, 5)
            .map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="text-xs px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                + {skill}
              </button>
            ))}
        </div>
      )}

      <p className={cn(
        "text-xs",
        value.length >= maxSkills ? "text-amber-500 font-medium" : "text-muted-foreground"
      )}>
        {value.length}/{maxSkills} skills added {value.length >= maxSkills && '(limit reached)'}
      </p>
    </div>
  );
}
