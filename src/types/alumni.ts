export type ProjectMember = {
    id: string;
    alumni: {
        id: string;
        name: string;
        current_title: string | null;
        current_position: string | null;
        linkedin_url: string | null;
        photo_url: string | null;
    };
};

export type ProjectScreenshot = {
    id: string;
    photo_url: string;
    caption: string | null;
};

export type Project = {
    id: string;
    title: string;
    description: string | null;
    tools_technologies: string[] | null;
    access_link: string | null;
    cover_image_url: string | null;
    cohort: string | null;
    year: number | null;
    members: ProjectMember[];
    screenshots: ProjectScreenshot[];
};

export type AlumniPerson = {
    id: string;
    name: string;
    current_title: string | null;
    current_position: string | null;
    linkedin_url: string | null;
    photo_url: string | null;
    cohort: string | null;
};
