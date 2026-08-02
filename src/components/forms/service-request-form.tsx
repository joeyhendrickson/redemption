"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BUDGET_RANGES,
  CONTACT_METHODS,
  CUSTOMER_RELATIONSHIPS,
  PROPERTY_TYPES,
  REFERRAL_SOURCES,
} from "@/lib/constants";
import { serviceRequestSchema, type ServiceRequestInput } from "@/lib/validations";
import { AccountCreateModal } from "@/components/forms/account-create-modal";

type CategoryOption = { value: string; label: string };

const STEPS = ["Contact", "Property & Service", "Details", "Review"];

export function ServiceRequestForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    referenceNumber: string;
    serviceRequestId: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<ServiceRequestInput>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredContact: "EMAIL",
      serviceAddress: "",
      city: "Columbus",
      state: "OH",
      zipCode: "",
      propertyType: "SINGLE_FAMILY",
      customerRelationship: "OWNER",
      serviceCategory: "",
      title: "",
      description: "",
      urgencyLevel: "NORMAL",
      safetyConcern: false,
      utilitiesShutoff: false,
      petsPresent: false,
      contactPermission: false,
      termsAccepted: false,
      conditionalAnswers: {},
    },
    mode: "onChange",
  });

  const watch = form.watch;
  const serviceCategory = watch("serviceCategory");
  const customerRelationship = watch("customerRelationship");
  const urgencyLevel = watch("urgencyLevel");
  const safetyConcern = watch("safetyConcern");
  const description = watch("description");

  const conditionalFields = useMemo(() => {
    const fields: { key: string; label: string; type: "text" | "boolean" | "select"; options?: string[] }[] = [];
    const cat = serviceCategory.toLowerCase();

    if (cat.includes("plumb")) {
      fields.push({ key: "waterLeaking", label: "Is water actively leaking?", type: "boolean" });
    }
    if (cat.includes("electrical") || cat.includes("electric")) {
      fields.push({
        key: "electricalSymptoms",
        label: "Any sparks, smoke, burning smell, or power loss?",
        type: "boolean",
      });
    }
    if (cat.includes("drywall")) {
      fields.push({ key: "approxDimensions", label: "Approximate repair dimensions", type: "text" });
      fields.push({ key: "waterDamage", label: "Is water damage involved?", type: "boolean" });
    }
    if (cat.includes("furniture") || cat.includes("assembly")) {
      fields.push({ key: "manufacturer", label: "Manufacturer", type: "text" });
      fields.push({ key: "model", label: "Model", type: "text" });
      fields.push({ key: "pieceCount", label: "Number of pieces", type: "text" });
    }
    if (cat.includes("rental") || cat.includes("property")) {
      fields.push({
        key: "rentalRole",
        label: "Are you the owner, manager, or tenant?",
        type: "select",
        options: ["Owner", "Manager", "Tenant"],
      });
    }
    if (customerRelationship === "RENTER") {
      fields.push({
        key: "landlordAuthorization",
        label: "Has landlord authorization been obtained?",
        type: "boolean",
      });
    }
    if (urgencyLevel === "URGENT" || urgencyLevel === "EMERGENCY_REVIEW") {
      fields.push({
        key: "immediateContactMethod",
        label: "Preferred immediate contact method",
        type: "select",
        options: ["Phone", "Text", "Email"],
      });
    }
    return fields;
  }, [serviceCategory, customerRelationship, urgencyLevel]);

  async function nextStep() {
    const fieldsByStep: (keyof ServiceRequestInput)[][] = [
      ["firstName", "lastName", "email", "phone", "preferredContact"],
      ["serviceAddress", "city", "state", "zipCode", "propertyType", "customerRelationship", "serviceCategory", "title"],
      ["description", "urgencyLevel", "safetyConcern"],
      ["contactPermission", "termsAccepted"],
    ];
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(data: ServiceRequestInput) {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(data));
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/service-requests", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Submission failed");

      setSubmitted({
        referenceNumber: result.referenceNumber,
        serviceRequestId: result.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      setShowAccountModal(true);
      toast.success("Service request submitted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h3 className="text-2xl font-semibold">Request received</h3>
          <p className="mt-2 text-muted-foreground">
            Reference number: <strong>{submitted.referenceNumber}</strong>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation email and will review your request shortly.
          </p>
          <Button className="mt-6" variant="cta" onClick={() => setShowAccountModal(true)}>
            Create your free account
          </Button>
        </div>
        <AccountCreateModal
          open={showAccountModal}
          onOpenChange={setShowAccountModal}
          defaultValues={{
            firstName: submitted.firstName,
            lastName: submitted.lastName,
            email: submitted.email,
            serviceRequestId: submitted.serviceRequestId,
          }}
        />
      </>
    );
  }

  return (
    <div id="request-service" className="rounded-2xl border border-gold/20 bg-card p-6 shadow-sm ring-1 ring-gold/10 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Request Service</h2>
        <div className="mt-2 h-1 w-14 rounded-full bg-gold" />
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your project. Most requests take about 2 minutes to submit.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register("firstName")} />
            </div>
            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register("lastName")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="sm:col-span-2">
              <Label>Preferred contact method</Label>
              <Select
                value={watch("preferredContact")}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue("preferredContact", value as ServiceRequestInput["preferredContact"]);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="serviceAddress">Service address</Label>
              <Input id="serviceAddress" {...form.register("serviceAddress")} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register("city")} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" {...form.register("state")} />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP code</Label>
              <Input id="zipCode" {...form.register("zipCode")} />
            </div>
            <div>
              <Label>Property type</Label>
              <Select
                value={watch("propertyType")}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue("propertyType", value as ServiceRequestInput["propertyType"]);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Your relationship to the property</Label>
              <Select
                value={watch("customerRelationship")}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue("customerRelationship", value as ServiceRequestInput["customerRelationship"]);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_RELATIONSHIPS.map((rel) => (
                    <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Service category</Label>
              <Select value={serviceCategory} onValueChange={(value) => value && form.setValue("serviceCategory", value)}>
                <SelectTrigger><SelectValue placeholder="Select a service category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="title">Request title</Label>
              <Input id="title" placeholder="Brief summary of the work needed" {...form.register("title")} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Detailed description</Label>
              <Textarea id="description" rows={5} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="requestedCompletionDate">Requested completion date</Label>
                <Input id="requestedCompletionDate" type="date" {...form.register("requestedCompletionDate")} />
              </div>
              <div>
                <Label>Urgency level</Label>
                <Select
                  value={watch("urgencyLevel")}
                  onValueChange={(value) => {
                    if (!value) return;
                    form.setValue("urgencyLevel", value as ServiceRequestInput["urgencyLevel"]);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="EMERGENCY_REVIEW">Emergency Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget range</Label>
                <Select value={watch("budgetRange") ?? ""} onValueChange={(value) => value && form.setValue("budgetRange", value)}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>How did you hear about us?</Label>
                <Select value={watch("referralSource") ?? ""} onValueChange={(value) => value && form.setValue("referralSource", value)}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {REFERRAL_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["safetyConcern", "This issue presents an immediate safety concern"],
                ["utilitiesShutoff", "Utilities may need to be shut off"],
                ["petsPresent", "Pets are present at the property"],
              ].map(([field, label]) => (
                <label key={field} className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    checked={watch(field as keyof ServiceRequestInput) as boolean}
                    onCheckedChange={(checked) => form.setValue(field as keyof ServiceRequestInput, Boolean(checked) as never)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            <div>
              <Label htmlFor="accessInstructions">Access instructions</Label>
              <Textarea id="accessInstructions" rows={3} {...form.register("accessInstructions")} />
            </div>

            {conditionalFields.length > 0 && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Additional details for your service type</p>
                {conditionalFields.map((field) => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    {field.type === "boolean" ? (
                      <label className="mt-2 flex items-center gap-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            const current = form.getValues("conditionalAnswers") ?? {};
                            form.setValue("conditionalAnswers", { ...current, [field.key]: Boolean(checked) });
                          }}
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                    ) : field.type === "select" ? (
                      <Select
                        onValueChange={(value) => {
                          const current = form.getValues("conditionalAnswers") ?? {};
                          form.setValue("conditionalAnswers", { ...current, [field.key]: value });
                        }}
                      >
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="mt-2"
                        onChange={(event) => {
                          const current = form.getValues("conditionalAnswers") ?? {};
                          form.setValue("conditionalAnswers", { ...current, [field.key]: event.target.value });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="files">Photos and documents</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                className="mt-2"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              />
              {files.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">{files.length} file(s) selected</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 text-sm">
              <p><strong>Name:</strong> {watch("firstName")} {watch("lastName")}</p>
              <p><strong>Email:</strong> {watch("email")}</p>
              <p><strong>Phone:</strong> {watch("phone")}</p>
              <p><strong>Address:</strong> {watch("serviceAddress")}, {watch("city")}, {watch("state")} {watch("zipCode")}</p>
              <p><strong>Service:</strong> {watch("serviceCategory")}</p>
              <p><strong>Title:</strong> {watch("title")}</p>
              <p><strong>Description:</strong> {watch("description")}</p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                checked={watch("contactPermission")}
                onCheckedChange={(checked) => form.setValue("contactPermission", Boolean(checked))}
              />
              <span className="text-sm">I give permission for Redemption Home Services to contact me about this request.</span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                checked={watch("termsAccepted")}
                onCheckedChange={(checked) => form.setValue("termsAccepted", Boolean(checked))}
              />
              <span className="text-sm">I accept the terms of service and privacy policy.</span>
            </label>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="cta" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="cta" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
