import type { NextPage } from "next";
import { useState } from "react";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { useDebouncedCallback } from "use-debounce";

type Form = {
  slug: string;
  url: string;
  password: string;
};

const CreateLinkForm: NextPage = () => {
  const [form, setForm] = useState<Form>({ slug: "", url: "", password: "" });
  const url = window.location.origin;

  const slugCheck = api.link.slugCheck.useQuery(
    {
      slug: form.slug,
    },
    {
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      enabled: false,
    },
  );

  const debounced = useDebouncedCallback(() => slugCheck.refetch(), 100);

  const createSlug = api.link.createSlug.useMutation();

  if (createSlug.status === "success") {
    return (
      <>
        <div className="flex items-center justify-center">
          <h1>{`${url}/${form.slug}`}</h1>
          <input
            type="button"
            value="Copy Link"
            className="ml-2 cursor-pointer rounded bg-pink-500 px-1 py-1.5 font-bold"
            onClick={async () => {
              await navigator.clipboard.writeText(`${url}/${form.slug}`);
            }}
          />
        </div>
        <input
          type="button"
          value="Reset"
          className="m-5 cursor-pointer rounded bg-pink-500 px-1 py-1.5 font-bold"
          onClick={() => {
            createSlug.reset();
            setForm({ slug: "", url: "", password: "" });
          }}
        />
      </>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createSlug.mutate({ ...form });
      }}
      className="flex h-screen flex-col justify-center sm:w-2/3 md:w-1/2 lg:w-1/3"
    >
      {form.slug?.trim() && !slugCheck.data?.isAvailable && (
        <span className="mr-2 text-center font-medium text-red-500">
          Slug already in use.
        </span>
      )}
      <div className="flex items-center">
        <span className="mr-2 font-medium">{url}/</span>
        <input
          type="text"
          onChange={(e) => {
            setForm({
              ...form,
              slug: e.target.value,
            });
            if (e.target.value.length > 0) {
              debounced();
            }
          }}
          minLength={1}
          placeholder="rothaniel"
          className={cn(
            "my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm",
            slugCheck.isFetched &&
              !slugCheck.data!.isAvailable &&
              "border-red-500 text-red-500",
          )}
          value={form.slug}
          pattern={"^[-a-zA-Z0-9]+$"}
          title="Only alphanumeric characters and hypens are allowed. No spaces."
          required
        />

        <input
          type="button"
          value="Random"
          className="ml-2 cursor-pointer rounded bg-pink-500 px-1 py-1.5 font-bold"
          onClick={() => {
            const slug = nanoid();
            setForm({
              ...form,
              slug,
            });
            slugCheck.refetch();
          }}
        />
      </div>
      <div className="flex items-center">
        <span className="mr-2 font-medium">Link</span>
        <input
          type="url"
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://google.com"
          className="my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm"
          required
        />
      </div>
      <div className="flex items-center">
        <span className="mr-2 font-medium">Password</span>
        <input
          type="password"
          onChange={(e) => {
            setForm({
              ...form,
              password: e.target.value,
            });
          }}
          minLength={8}
          className={cn(
            "my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm",
          )}
          value={form.password}
          required
        />
      </div>

      <input
        type="submit"
        value="Create"
        className="mt-1 cursor-pointer rounded bg-pink-500 p-1 font-bold"
        disabled={slugCheck.isFetched && !slugCheck.data!.isAvailable}
      />
    </form>
  );
};

export default CreateLinkForm;
