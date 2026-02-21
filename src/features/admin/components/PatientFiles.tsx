import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface PatientFile {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    description: string;
    created_at: string;
}

interface PatientFilesProps {
    patientId: string;
}

export const PatientFiles = ({ patientId }: PatientFilesProps) => {
    const [files, setFiles] = useState<PatientFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    // Delete Confirmation State
    const [fileToDelete, setFileToDelete] = useState<PatientFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [patientId]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('patient_uploads')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFiles(data || []);
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.error("Error al cargar archivos");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Por favor selecciona un archivo");
            return;
        }

        try {
            setUploading(true);
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${patientId}/${Date.now()}.${fileExt}`;
            const filePath = fileName;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('patient_files')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Insert Metadata
            const { error: dbError } = await supabase
                .from('patient_uploads')
                .insert([{
                    patient_id: patientId,
                    file_name: selectedFile.name,
                    file_path: filePath,
                    file_type: selectedFile.type,
                    description: description
                }]);

            if (dbError) throw dbError;

            toast.success("Archivo subido correctamente");
            setSelectedFile(null);
            setDescription('');
            // Reset input file manually if needed, or rely on key change
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            fetchFiles();

        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error("Error al subir el archivo");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (file: PatientFile) => {
        setFileToDelete(file);
    };

    const confirmDeleteFile = async () => {
        if (!fileToDelete) return;

        try {
            setIsDeleting(true);
            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('patient_files')
                .remove([fileToDelete.file_path]);

            if (storageError) {
                console.error("Storage delete error", storageError);
                // Continue identifying it might be already gone or db inconsistent
            }

            // 2. Delete from DB
            const { error: dbError } = await supabase
                .from('patient_uploads')
                .delete()
                .eq('id', fileToDelete.id);

            if (dbError) throw dbError;

            toast.success("Archivo eliminado");
            setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
            setFileToDelete(null);

        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error("Error al eliminar el archivo");
        } finally {
            setIsDeleting(false);
        }
    };

    const getFileUrl = (filePath: string) => {
        const { data } = supabase.storage
            .from('patient_files')
            .getPublicUrl(filePath);
        return data.publicUrl;
    };

    const getThumbnailUrl = (filePath: string) => {
        // Optimizes bandwidth by requesting a resized version (Supabase Image Transformations)
        // Requires Image Transformations enabled in Supabase Project
        const { data } = supabase.storage
            .from('patient_files')
            .getPublicUrl(filePath, {
                transform: {
                    width: 300,
                    height: 200,
                    resize: 'cover',
                    quality: 80
                }
            });
        return data.publicUrl;
    };

    const isImage = (type: string) => type.startsWith('image/');

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Subir Nuevo Archivo</CardTitle>
                    <CardDescription>Formatos permitidos: Imágenes (JPG, PNG) y Documentos (PDF)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Archivo</Label>
                            <div className="flex gap-2 items-center">
                                <Label
                                    htmlFor="file-upload"
                                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-900 h-10 px-4 py-2 shadow-sm"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                                </Label>
                                <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
                                </span>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf"
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Input
                                id="description"
                                placeholder="Ej: Radiografía de tórax, Análisis de sangre..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpload}
                            disabled={uploading || !selectedFile}
                            className="bg-[#1c334a]"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" /> Subir Archivo
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Files List */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Archivos Guardados ({files.length})
                </h3>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-10 bg-white border rounded-lg text-gray-400">
                        No hay archivos cargados para este paciente.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {files.map(file => {
                            const publicUrl = getFileUrl(file.file_path);
                            const thumbnailUrl = getThumbnailUrl(file.file_path);

                            return (
                                <Card key={file.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="aspect-video bg-gray-100 relative items-center justify-center flex overflow-hidden">
                                        {isImage(file.file_type) ? (
                                            <img
                                                src={thumbnailUrl}
                                                loading="lazy"
                                                alt={file.file_name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <FileText className="w-16 h-16 text-gray-300" />
                                        )}
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" asChild title="Ver / Descargar">
                                                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => handleDelete(file)}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-3 space-y-1">
                                        <div className="font-medium truncate" title={file.file_name}>
                                            {file.description || file.file_name}
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>{format(new Date(file.created_at), "d MMMM yyyy", { locale: es })}</span>
                                            <span className="uppercase">{file.file_type.split('/')[1] || 'FILE'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!fileToDelete}
                onOpenChange={(open) => !open && setFileToDelete(null)}
                title="¿Eliminar archivo?"
                description={`¿Estás seguro de que deseas eliminar permanentemente "${fileToDelete?.description || fileToDelete?.file_name}"?`}
                onConfirm={confirmDeleteFile}
                isLoading={isDeleting}
            />
        </div>
    );
};
