import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CancellationPolicyProps {
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
  className?: string;
}

export const CancellationPolicy = ({ agreed, onAgreeChange, className }: CancellationPolicyProps) => {
  return (
    <Card className={`border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 ${className || ''}`}>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold text-base uppercase tracking-wide">
          CANCELLATION / RESCHEDULE POLICY
        </h3>
        <p className="text-sm leading-relaxed text-foreground/90">
          We kindly ask you to make any changes 3 hours prior to your scheduled appointment. 
          If you cancel or reschedule your appointment with less than 3 hours you will be charged 
          50% of the total cost, as we are holding the time for you and turning away others. 
          Please be responsible! With all respect to you.
        </p>
        <div className="flex items-start gap-2 pt-2">
          <Checkbox 
            id="policy-agree" 
            checked={agreed}
            onCheckedChange={(checked) => onAgreeChange(checked === true)}
          />
          <Label 
            htmlFor="policy-agree" 
            className="text-sm cursor-pointer leading-tight font-medium"
          >
            I agree to the policy. (Check to proceed)
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
