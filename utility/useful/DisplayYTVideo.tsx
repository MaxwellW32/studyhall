
export default function DisplayYTVideo({ videoId }: { videoId: string }) {


    return (
        <iframe
            style={{
                width: "100%",
                aspectRatio: "16/9",
            }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    );
}
