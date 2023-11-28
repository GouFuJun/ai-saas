"use client";

import axios from "axios";
import * as z from "zod";

import {MUSIC} from "@/constants";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useState} from "react";

import Heading from "@/components/heading";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

import {formSchema} from "./constants";
import {Button} from "@/components/ui/button";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import {useProModal} from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";

const MusicPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [music, setMusic] = useState<string>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  })

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);

      const response = await axios.post("/api/music", values);

      setMusic(response.data.audio);

      form.reset();

    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      router.refresh();
    }
  }

  return (
    <>
      <Heading
        title={MUSIC.label}
        description={MUSIC.desc}
        icon={MUSIC.icon}
        iconColor={MUSIC.color}
        bgColor={MUSIC.bgColor}
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField name="prompt" render={({field}) => (
              <FormItem className="col-span-12 lg:col-span-10">
                <FormControl className="m-0 p-0">
                  <Input
                    className="border-0 outline-none px-4 bg-[#e8f0fe] focus-visible:ring-0 focus-visible:ring-transparent"
                    disabled={isLoading}
                    placeholder="Piano solo"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )} />
            <Button className="col-span-12 lg:col-span-2" disabled={isLoading}>Generate</Button>
          </form>
        </Form>
      </div>
      <div className="space-y-4 mt-4 px-4">
        {
          isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )
        }
        {
          !music && !isLoading && (
            <Empty label="No music generated." />
          )
        }
        {
          music && (
            <audio controls className="w-full mt-8">
              <source src={music}/>
            </audio>
          )
        }
      </div>
    </>
  )
}

export default MusicPage;
