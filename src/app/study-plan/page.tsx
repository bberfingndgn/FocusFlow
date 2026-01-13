"use client";

import { useState, useEffect, type FormEvent } from "react";
import { generateStudyPlanAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormState {
  studyPlan: string | null;
  error: string | null;
  fieldErrors?: {
    subjects?: string[];
    availableTime?: string[];
    learningPreferences?: string[];
  };
}

const initialState: FormState = {
  studyPlan: null,
  error: null,
  fieldErrors: {},
};

export default function StudyPlanPage() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
    if (formState.error && !formState.fieldErrors) { // Only toast for general errors
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: formState.error,
      });
    }
  }, [formState, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await generateStudyPlanAction(initialState, formData);
    setFormState(result);
    setLoading(false);
  }

  return (
    <div className="container mx-auto py-8 px-4 flex-1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline text-primary">Personalized Study Plan</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Let our AI craft the perfect study schedule just for you.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Tell us about your needs</CardTitle>
                        <CardDescription>The more details, the better the plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subjects">Subjects</Label>
                            <Input id="subjects" name="subjects" placeholder="e.g., Math, Science, History" required disabled={loading} />
                             {formState.fieldErrors?.subjects && <p className="text-sm text-destructive">{formState.fieldErrors.subjects[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="availableTime">Available Time</Label>
                            <Input id="availableTime" name="availableTime" placeholder="e.g., 2 hours on weekdays, 4 hours on weekends" required disabled={loading} />
                             {formState.fieldErrors?.availableTime && <p className="text-sm text-destructive">{formState.fieldErrors.availableTime[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="learningPreferences">Learning Preferences</Label>
                            <Textarea id="learningPreferences" name="learningPreferences" placeholder="e.g., I like visuals, prefer studying in the morning..." required disabled={loading} />
                             {formState.fieldErrors?.learningPreferences && <p className="text-sm text-destructive">{formState.fieldErrors.learningPreferences[0]}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate My Plan
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Your AI-Generated Plan</CardTitle>
                    <CardDescription>Here's your roadmap to success.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 whitespace-pre-wrap font-mono text-sm bg-muted/50 p-6 rounded-lg overflow-auto">
                    {loading ? (
                         <div className="flex items-center justify-center h-full">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : formState.studyPlan ? (
                        <p>{formState.studyPlan}</p>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Your plan will appear here...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
