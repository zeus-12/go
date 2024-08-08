import type { NextPage } from "next";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const slugSchema = z
  .string()
  .min(1)
  .max(50)
  .refine((slug) => /^[a-zA-Z0-9_-]+$/.test(slug));

const formSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(50)
    .refine((slug) => /^[a-zA-Z0-9_-]+$/.test(slug)),
  url: z.string().min(1),
  password: z.string().min(8),
});

const CreateLinkForm: NextPage = () => {
  const url = window.location.origin;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      url: "",
      password: "",
    },
  });

  const slugCheck = api.link.slugCheck.useMutation();

  const debounced = useDebouncedCallback(() => {
    if (slugSchema.safeParse(form.getValues().slug).success === false) {
      return;
    }

    slugCheck.mutate({
      slug: form.getValues().slug,
    });
  }, 1000);

  const createSlug = api.link.createSlug.useMutation();

  const isEnabled =
    form.formState.isValid &&
    !debounced.isPending() &&
    slugCheck.isSuccess &&
    slugCheck.data?.isAvailable;

  if (createSlug.status === "success") {
    return (
      <>
        <div className="flex items-center justify-center">
          <h1>{`${url}/${form.getValues().slug}`}</h1>

          <Button
            className="ml-2 cursor-pointer rounded bg-pink-500 px-1 py-1.5"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `${url}/${form.getValues().slug}`,
              );
            }}
          >
            Copy Link
          </Button>
        </div>
        <input
          type="button"
          value="Back"
          className="m-5 cursor-pointer rounded bg-pink-500 px-1 py-1.5 font-bold"
          onClick={() => {
            createSlug.reset();
            form.reset();
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col justify-center sm:w-2/3 md:w-1/2 lg:w-1/3">
      {/* {form.slug?.trim() &&
          slugCheck.isFetched &&
          !slugCheck.data?.isAvailable && (
            <span className="mr-2 text-center font-medium text-red-500">
              Slug already in use.
            </span>
          )} */}

      <Form {...form}>
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <span className="mr-2 font-medium">{url}/</span>

                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced();
                    }}
                    placeholder="slug"
                    className={cn(
                      "my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm",
                      slugCheck.isSuccess &&
                        !slugCheck.data!.isAvailable &&
                        "border-red-500 text-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage />

                <Button
                  className="ml-2 cursor-pointer rounded bg-pink-500 px-1 py-1.5 font-bold hover:bg-pink-600"
                  onClick={() => {
                    const slug = nanoid();
                    form.setValue("slug", slug);
                    slugCheck.mutate({
                      slug,
                    });
                  }}
                >
                  Random
                </Button>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <span className="mr-2 font-medium">Link</span>

                <FormControl>
                  <Input
                    placeholder="https://google.com"
                    {...field}
                    className="my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm"
                  />
                </FormControl>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <span className="mr-2 font-medium">Password</span>

                <FormControl>
                  <Input
                    placeholder="password"
                    {...field}
                    type="password"
                    className={cn(
                      "my-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-black placeholder-slate-400 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm",
                    )}
                  />
                </FormControl>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          className="mt-1 cursor-pointer rounded bg-pink-500 p-1 font-bold disabled:bg-pink-300"
          disabled={!isEnabled}
          onClick={(e) => {
            if (form.formState.isValid) {
              e.preventDefault();
              createSlug.mutate(form.getValues());
            }
          }}
        >
          {(slugCheck.isPending || createSlug.isPending) && <Spinner />}
          Create
        </Button>
      </Form>
    </div>
  );
};

export default CreateLinkForm;
