'use client';

export default function CreateDummyEntries() {
    return (
        <div>
            <h2>Create Dummy Entries</h2>
            <form method="POST" action="/api/habits/blank/entries/createData">
                <button type="submit">Create Dummy Data</button>
            </form>
        </div>
    );
}