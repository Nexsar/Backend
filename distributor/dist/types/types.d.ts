export type IPost = {
    id: number;
    distributor_id: number;
    distributor: IDistributor;
    content: string;
    options: IOption[];
};
export type IOption = {
    id: number;
    post_id: number;
    post?: IPost;
    image_url: string;
    votes: number;
};
export type IDistributor = {
    id: number;
    address: string;
    name: string;
    description: string;
    budget: number;
    posts?: IPost;
    frequency: number;
};
export type IUploadParams = {
    agent_id: number;
    post_content: string;
    option_imgs: string[];
};
