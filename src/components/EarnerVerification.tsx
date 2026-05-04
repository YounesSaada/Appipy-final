import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Upload, CheckCircle2, Loader2, AlertCircle, FileText, User, MapPin, Phone, Calendar } from "lucide-react";
import hero1 from "../assets/hero1.png";import { projectId, publicAnonKey } from "../utils/supabase/info";

interface EarnerVerificationProps {
  onVerificationComplete: () => void;
}

type DocumentType = "governmentId" | "proofOfAddress";

interface UploadedFile {
  file: File;
  preview: string;
}

export function EarnerVerification({ onVerificationComplete }: EarnerVerificationProps) {
  const [uploads, setUploads] = useState<Record<DocumentType, UploadedFile | null>>({
    governmentId: null,
    proofOfAddress: null,
  });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

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

    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    if (!address) {
      newErrors.address = "Address is required";
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
      formData.append("phoneNumber", phoneNumber);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("address", address);
      
      if (uploads.governmentId) {
        formData.append("governmentId", uploads.governmentId.file);
      }
      if (uploads.proofOfAddress) {
        formData.append("proofOfAddress", uploads.proofOfAddress.file);
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/verification/earner`;
      
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
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <header className="bg-blue-900 text-white py-4 px-6 md:px-10">
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
            
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Verification Documents Submitted
            </h1>
            
            <p className="text-lg text-blue-700 mb-8">
              Thank you for submitting your verification documents. We will review them and let you know whether your verification was approved or not.
            </p>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 text-left">
                  <p className="font-semibold mb-1">What's Next?</p>
                  <p>Our team typically reviews verification documents within 24-48 hours. You'll receive an email notification once your account has been reviewed and approved. You can start exploring your dashboard now!</p>
                </div>
              </div>
            </div>

            <Button
              onClick={onVerificationComplete}
              className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold"
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
    icon: typeof FileText;
    acceptedFormats: string;
  }> = [
    {
      type: "governmentId",
      label: "Government ID",
      description: "Passport, National ID, Driver's License, or State ID",
      icon: User,
      acceptedFormats: "image/*,application/pdf"
    },
    {
      type: "proofOfAddress",
      label: "Proof of Address",
      description: "Utility bill, bank statement, or lease agreement",
      icon: MapPin,
      acceptedFormats: "image/*,application/pdf"
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <header className="bg-blue-900 text-white py-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center">
          <img src={hero1} alt="Appipy" className="h-8 w-auto" />
        </div>
      </header>

      <div className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              Verify Your Identity
            </h1>
            <p className="text-lg text-blue-700">
              To start earning on Appipy, we need to verify your identity and information.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-white shadow-xl border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="border border-blue-300 bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-900" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-900">Personal Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-blue-900 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) {
                          setErrors({ ...errors, phoneNumber: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.phoneNumber ? "border-red-500" : ""}`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="text-blue-900 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        if (errors.dateOfBirth) {
                          setErrors({ ...errors, dateOfBirth: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.dateOfBirth ? "border-red-500" : ""}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-blue-900 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address *
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main St, City, State, ZIP"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) {
                          setErrors({ ...errors, address: "" });
                        }
                      }}
                      className={`mt-2 bg-white ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-700 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-blue-900">Required Documents</h2>
                </div>
              </div>

              {documentFields.map(({ type, label, description, icon: Icon, acceptedFormats }) => {
                const upload = uploads[type];
                
                return (
                  <div key={type} className="border border-blue-200 rounded-lg p-5 hover:border-blue-400 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-700" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <Label className="text-lg font-semibold text-blue-900">
                              {label}
                            </Label>
                            <p className="text-sm text-blue-600 mt-1">
                              {description}
                            </p>
                          </div>
                          
                          {upload && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>

                        {upload ? (
                          <div className="mt-3 bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {upload.file.type.startsWith('image/') ? (
                                  <img 
                                    src={upload.preview} 
                                    alt="Preview" 
                                    className="h-12 w-12 object-cover rounded border border-blue-200"
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-blue-200 rounded border border-blue-300 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-700" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-blue-900 truncate">
                                    {upload.file.name}
                                  </p>
                                  <p className="text-xs text-blue-600">
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
                              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-center">
                                <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-blue-700">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
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

              <div className="pt-6 border-t border-blue-200">
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

                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">Important Information</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>You must be at least 18 years old to earn on Appipy</li>
                        <li>All documents must be valid and not expired</li>
                        <li>Documents should be clear and all information should be readable</li>
                        <li>Your personal information will be kept secure and confidential</li>
                        <li>Verification typically takes 24-48 hours</li>
                        <li>You'll be notified via email once your account is verified</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!allDocumentsUploaded || isSubmitting}
                  className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold disabled:bg-blue-200 disabled:text-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting Documents...
                    </>
                  ) : (
                    <>
                      {allDocumentsUploaded ? 'Submit for Verification' : `Upload All Documents (${Object.values(uploads).filter(u => u !== null).length}/2)`}
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