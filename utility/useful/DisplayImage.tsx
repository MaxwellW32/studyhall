
export default function DisplayImage({ imageID }: { imageID: string }) {


    return (
        <img style={{ height: "100%", objectFit: "cover" }} src={imageID} />
    );
}
