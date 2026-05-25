import { useParams } from "react-router-dom";

function IncidentDetails() {
    const { id } = useParams();

    return (
        <div>
            <h1 className="text-3xl font-bold">
                Incident Details
            </h1>

            <p className="mt-4 text-gray-500">
                Incident ID: {id}
            </p>
        </div>
    );
}

export default IncidentDetails;