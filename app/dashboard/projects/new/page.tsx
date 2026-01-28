import { Header } from "@/components/dashboard/header";
import { ProjectForm } from "@/components/forms/project-form";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header title="New Project" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <ProjectForm mode="create" />
        </div>
      </div>
    </div>
  );
}
