export interface fileserver {
    id: number;
    name: string;
    address: string;
    type: string;
    store_path: string;
    bin_path: string;
}


export interface dds_file {
    fileId: number;
    name: string;
    size: number;
    content_type: string;
    created_date: string;
    fileserver: fileserver;
    path: string;
}