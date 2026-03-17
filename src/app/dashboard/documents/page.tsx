"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Search,
  Upload,
  FolderOpen,
  FileCheck,
  Receipt,
  FileSignature,
  Image,
  Building2,
  Eye,
} from "lucide-react";
import { getRelativeTime } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import type { Document, Project } from "@/lib/types";

import { toast } from "sonner";

// TODO: Fetch from Supabase — see /lib/data/projects.ts pattern
// Documents feature — placeholder until document storage is implemented
const mockDocuments: Document[] = [];
const projects: Project[] = []; // TODO: Fetch from getProjects() to populate project dropdown

const documentTypes = [
  { id: "all", name: "All Documents", icon: FolderOpen },
  { id: "contract", name: "Contracts", icon: FileSignature },
  { id: "po", name: "Purchase Orders", icon: FileCheck },
  { id: "invoice", name: "Invoices", icon: FileText },
  { id: "receipt", name: "Receipts", icon: Receipt },
  { id: "drawing", name: "Drawings", icon: Image },
  { id: "approval", name: "Approvals", icon: FileCheck },
];

const typeColors: Record<string, string> = {
  contract: "bg-purple-100 text-purple-800",
  po: "bg-blue-100 text-blue-800",
  invoice: "bg-orange-100 text-orange-800",
  receipt: "bg-green-100 text-green-800",
  drawing: "bg-pink-100 text-pink-800",
  approval: "bg-emerald-100 text-emerald-800",
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [notes, setNotes] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = activeType === "all" || doc.type === activeType;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    const typeConfig = documentTypes.find((t) => t.id === type);
    if (!typeConfig) return FileText;
    return typeConfig.icon;
  };

  const handleDownload = (doc: Document) => {
    // For mock documents (D001-D008), use HTML files we created
    // For user-uploaded documents, use their actual file type
    const isMockDoc = doc.id.startsWith('D00') && parseInt(doc.id.slice(1)) <= 8;
    const fileExt = isMockDoc ? 'html' : doc.fileType;

    // Create download link
    const link = document.createElement('a');
    link.href = `/documents/${doc.id}.${fileExt}`;
    link.download = doc.name + (isMockDoc ? '.html' : '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${doc.name}...`);
  };

  const handleViewDocument = (doc: Document) => {
    // For mock documents, open in new tab for full viewing
    const isMockDoc = doc.id.startsWith('D00') && parseInt(doc.id.slice(1)) <= 8;
    if (isMockDoc) {
      window.open(`/documents/${doc.id}.html`, '_blank');
    } else {
      // For user-uploaded docs, show the preview dialog
      setViewingDoc(doc);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    if (!selectedDocType) {
      toast.error("Please select a document type");
      return;
    }

    // Get selected project name
    const project = projects.find((p) => p.id === selectedProject);
    const projectName = project?.name || selectedProject;

    // Create new document object
    const newDocument: Document = {
      id: `D-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: selectedFile.name,
      type: selectedDocType as Document["type"],
      project: projectName,
      uploadedAt: new Date().toISOString(),
      fileType: selectedFile.name.split(".").pop() || "pdf",
      size: `${(selectedFile.size / 1024).toFixed(0)} KB`,
    };

    // Add to documents state
    setDocuments([newDocument, ...documents]);

    // Show success toast
    toast.success(`Successfully uploaded ${selectedFile.name}`);

    // Reset form and close dialog
    setSelectedFile(null);
    setSelectedProject("");
    setSelectedDocType("");
    setNotes("");
    setUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Access project contracts, POs, invoices, and drawings
          </p>
        </div>
        {user?.role !== 'viewer' && (
          <Button
            className="gap-2 w-full sm:w-auto"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        )}
      </div>

      {/* Document Type Filters */}
      <div className="flex flex-wrap gap-2">
        {documentTypes.map((type) => (
          <Button
            key={type.id}
            variant={activeType === type.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType(type.id)}
            className="gap-2"
          >
            <type.icon className="h-4 w-4" />
            {type.name}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents by name or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDocuments.map((doc) => {
              const TypeIcon = getTypeIcon(doc.type);
              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3 sm:p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{doc.project}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 sm:hidden">
                        <span>{getRelativeTime(doc.uploadedAt)}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <Badge className={typeColors[doc.type] || "bg-gray-100 text-gray-800"}>
                      {doc.type}
                    </Badge>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">
                        {getRelativeTime(doc.uploadedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} • {doc.fileType.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            {user?.role !== 'viewer' && (
              <Button
                className="gap-2"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to your project library
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* File Input */}
            <div className="grid gap-2">
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>

            {/* Project Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter((p) => p.status === "active")
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="docType">Document Type</Label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes
                    .filter((type) => type.id !== "all")
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={viewingDoc !== null} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingDoc && (
                <>
                  {(() => {
                    const TypeIcon = getTypeIcon(viewingDoc.type);
                    return <TypeIcon className="h-5 w-5" />;
                  })()}
                  {viewingDoc.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Document preview and details
            </DialogDescription>
          </DialogHeader>

          {viewingDoc && (
            <div className="grid gap-4">
              {/* Document Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge className={`mt-1 ${typeColors[viewingDoc.type] || "bg-gray-100 text-gray-800"}`}>
                    {viewingDoc.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{viewingDoc.project}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p className="text-sm font-medium mt-1">{viewingDoc.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Format</p>
                  <p className="text-sm font-medium mt-1">{viewingDoc.fileType.toUpperCase()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                  <p className="text-sm font-medium mt-1">
                    {getRelativeTime(viewingDoc.uploadedAt)} • {new Date(viewingDoc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <div className="p-4 border-b bg-background">
                  <p className="text-sm font-medium">Document Preview</p>
                </div>
                <div className="p-6 min-h-[300px] max-h-[400px] overflow-auto">
                  {/* For PDF and common document types, show iframe */}
                  {(viewingDoc.fileType === 'pdf' || viewingDoc.fileType === 'doc' || viewingDoc.fileType === 'docx') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center bg-white p-8 rounded border">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Preview not available in demo mode</p>
                        <p>In production, this would display:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                          /documents/{viewingDoc.id}.{viewingDoc.fileType}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* For images, show image preview */}
                  {(viewingDoc.fileType === 'png' || viewingDoc.fileType === 'jpg' || viewingDoc.fileType === 'jpeg') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center bg-white p-8 rounded border">
                        <Image className="h-16 w-16 text-muted-foreground" aria-label="Image preview icon" />
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Image preview</p>
                        <p>In production, this would display:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                          /documents/{viewingDoc.id}.{viewingDoc.fileType}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* For Excel/spreadsheets */}
                  {(viewingDoc.fileType === 'xlsx' || viewingDoc.fileType === 'xls') && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center bg-white p-8 rounded border">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Spreadsheet preview</p>
                        <p>In production, this would display:</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                          /documents/{viewingDoc.id}.{viewingDoc.fileType}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewingDoc(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (viewingDoc) {
                  handleDownload(viewingDoc);
                }
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
