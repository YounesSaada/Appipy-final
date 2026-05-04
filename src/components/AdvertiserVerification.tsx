import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Upload, CheckCircle2, Loader2, AlertCircle, FileText, Building2, CreditCard, Mail, MapPin, Phone } from "lucide-react";
import hero1 from "../assets/hero1.png";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AdvertiserVerificationProps {
  onVerificationComplete: () => void;
}

type DocumentType = 
  | "governmentId"
  | "businessRegistration"
  | "proofOfAddress"
  | "taxDocument";

interface UploadedFile {
  file: File;
  preview: string;
}

export function AdvertiserVerification({ onVerificationComplete }: AdvertiserVerificationProps) {
  const [uploads, setUploads] = useState<Record<DocumentType, UploadedFile | null>>({
    governmentId: null,
    businessRegistration: null,
    proofOfAddress: null,
    taxDocument: null,
  });

  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (type: DocumentType, file: File) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setUploads(prev => ({
        ...prev,
        [type]: { file, preview }
      }));
    }
  };

  const handleRemoveFile = (type: DocumentType) => {
    if (uploads[type]?.preview) {
      URL.revokeObjectURL(uploads[type]!.preview);
    }
    setUploads(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const allDocumentsUploaded = Object.values(uploads).every(upload => upload !== null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!businessEmail) {
      newErrors.businessEmail = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      newErrors.businessEmail = "Please enter a valid email address";
    }

    if (!businessPhone) {
      newErrors.businessPhone = "Business phone is required";
    }

    if (!businessAddress) {
      newErrors.businessAddress = "Business address is required";
    }

    if (!taxId) {
      newErrors.taxId = "Tax ID / EIN is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allDocumentsUploaded) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem("appipy_access_token");
      
      if (!accessToken) {
        setErrors({ submit: "Not authenticated. Please sign in again." });
        setIsSubmitting(false);
        return;
      }

      // Create FormData to upload files
      const formData = new FormData();
      formData.append("businessAddress", businessAddress);
      formData.append("taxId", taxId);
      formData.append("websiteUrl", businessEmail); // Using email as website placeholder
      
      if (uploads.businessRegistration) {
        formData.append("businessLicense", uploads.businessRegistration.file);
      }
      if (uploads.taxDocument) {
        formData.append("taxDocument", uploads.taxDocument.file);
      }
      if (uploads.proofOfAddress) {
        formData.append("proofOfAddress", uploads.proofOfAddress.file);
      }
      if (uploads.governmentId) {
        formData.append("ownershipDocument", uploads.governmentId.file);
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/verification/advertiser`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit verification");
      }

      console.log("Verification submitted successfully:", data);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Verification submission error:", err);
      setErrors({ submit: err instanceof Error ? err.message : "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success View
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-slate-900 text-white py-4 px-6 md:px-10">
          <div className="max-w-7xl mx-auto flex items-center">
            <img src={hero1} alt="Appipy" className="h-8 w-auto" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-12 bg-white shadow-xl border-0 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Verification Documents Submitted
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Thank you for submitting your verification documents. We will review them and let you know whether your verification was approved or not.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 text-left">
                  <p className="font-semibold mb-1">What's Next?</p>
                  <p>Our team typically reviews verification documents within 24-48 hours. You'll receive an email notification once your account has been reviewed and approved.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={onVerificationComplete}
              className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800 text-white"
            >
              Return to Homepage
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Upload Form View
  const documentFields: Array<{
    type: DocumentType;
    label: string;
    description: string;
    icon: typeof CreditCard;
    acceptedFormats: string;
  }> = [
    {
      type: "governmentId",
      label: "Government ID",
      description: "Passport, National ID, or State ID of business owner",
      icon: CreditCard,
      acceptedFormats: "image/*,application/pdf"
    },
    {
      type: "businessRegistration",
      label: "Business Registration Document",
      description: "Certificate of incorporation, business license, or DBA",
      icon: Building2,
      acceptedFormats: "image/*,application/pdf"
    },
    {
      type: "proofOfAddress",
      label: "Proof of Business Address",
      description: "Utility bill, lease agreement, or bank statement",
      icon: MapPin,
      acceptedFormats: "image/*,application/pdf"
    },
    {
      type: "taxDocument",
      label: "Tax Document",
      description: "W-9, tax return, or EIN confirmation letter",
      icon: FileText,
      acceptedFormats: "image/*,application/pdf"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white py-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center">
          <img src={hero1} alt="Appipy" className="h-8 w-auto" />
        </div>
      </header>

      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Verify Your Business
            </h1>
            <p className="text-lg text-slate-600">
              To start advertising on Appipy, we need to verify your business identity and information.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-white shadow-xl border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information Section */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Business Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessEmail" className="text-slate-900 font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Business Email *
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="contact@yourbusiness.com"
                      value={businessEmail}
                      onChange={(e) => {
                        setBusinessEmail(e.target.value);
                        if (errors.businessEmail) {
                          setErrors({ ...errors, businessEmail: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.businessEmail ? "border-red-500" : ""}`}
                    />
                    {errors.businessEmail && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessPhone" className="text-slate-900 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Business Phone *
                    </Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={businessPhone}
                      onChange={(e) => {
                        setBusinessPhone(e.target.value);
                        if (errors.businessPhone) {
                          setErrors({ ...errors, businessPhone: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.businessPhone ? "border-red-500" : ""}`}
                    />
                    {errors.businessPhone && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessPhone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessAddress" className="text-slate-900 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Business Address *
                    </Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="123 Business St, City, State, ZIP"
                      value={businessAddress}
                      onChange={(e) => {
                        setBusinessAddress(e.target.value);
                        if (errors.businessAddress) {
                          setErrors({ ...errors, businessAddress: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.businessAddress ? "border-red-500" : ""}`}
                    />
                    {errors.businessAddress && (
                      <p className="text-red-600 text-sm mt-1">{errors.businessAddress}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="taxId" className="text-slate-900 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tax ID / EIN *
                    </Label>
                    <Input
                      id="taxId"
                      type="text"
                      placeholder="12-3456789"
                      value={taxId}
                      onChange={(e) => {
                        setTaxId(e.target.value);
                        if (errors.taxId) {
                          setErrors({ ...errors, taxId: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.taxId ? "border-red-500" : ""}`}
                    />
                    {errors.taxId && (
                      <p className="text-red-600 text-sm mt-1">{errors.taxId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Required Documents</h2>
                </div>
              </div>

              {documentFields.map(({ type, label, description, icon: Icon, acceptedFormats }) => {
                const upload = uploads[type];
                
                return (
                  <div key={type} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-700" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <Label className="text-lg font-semibold text-slate-900">
                              {label}
                            </Label>
                            <p className="text-sm text-slate-500 mt-1">
                              {description}
                            </p>
                          </div>
                          
                          {upload && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        {upload ? (
                          <div className="mt-3 bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {upload.file.type.startsWith('image/') ? (
                                  <img 
                                    src={upload.preview} 
                                    alt="Preview" 
                                    className="h-12 w-12 object-cover rounded border border-slate-200"
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-slate-200 rounded border border-slate-300 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-slate-600" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {upload.file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFile(type)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <label className="cursor-pointer">
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
                                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-700">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Image or PDF file (Max 10MB)
                                </p>
                              </div>
                              <input
                                type="file"
                                accept={acceptedFormats}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(type, file);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-6 border-t border-slate-200">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-700 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-900">
                        <p className="font-semibold mb-1">Submission Error</p>
                        <p>{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">Important Information</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>All documents must be valid and not expired</li>
                        <li>Documents should be clear and all information should be readable</li>
                        <li>Business information will be kept secure and confidential</li>
                        <li>Verification typically takes 24-48 hours</li>
                        <li>You'll be notified via email once your account is verified</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!allDocumentsUploaded || isSubmitting}
                  className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800 text-white disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting Documents...
                    </>
                  ) : (
                    <>
                      {allDocumentsUploaded ? 'Submit for Verification' : `Upload All Documents (${Object.values(uploads).filter(u => u !== null).length}/4)`}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}