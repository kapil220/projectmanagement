import { z } from 'zod';
import { slugify } from '../server-common';
import {
  teamName,
  apiKeyId,
  slug,
  domain,
  email,
  password,
  token,
  role,
  sentViaEmail,
  domains,
  expiredToken,
  sessionId,
  recaptchaToken,
  priceId,
  quantity,
  memberId,
  inviteToken,
  url,
  endpointId,
  sentViaEmailString,
  invitationId,
  name,
  image,
  eventTypes
} from './primitives';

export const createApiKeySchema = z.object({
  name: name(50),
});

export const deleteApiKeySchema = z.object({
  apiKeyId,
});

export const teamSlugSchema = z.object({
  slug,
});

export const updateTeamSchema = z.object({
  name: teamName,
  slug: slug.transform((slug) => slugify(slug)),
  domain,
});

export const createTeamSchema = z.object({
  name: teamName,
});

export const updateAccountSchema = z.union([
  z.object({
    email,
  }),
  z.object({
    name: name(),
  }),
  z.object({
    image,
  }),
]);

export const updatePasswordSchema = z.object({
  currentPassword: password,
  newPassword: password,
});

export const userJoinSchema = z.union([
  z.object({
    team: teamName,
    slug,
  }),
  z.object({
    name: name(),
    email,
    password,
  }),
]);

export const resetPasswordSchema = z.object({
  password,
  token,
});

export const inviteViaEmailSchema = z.union([
  z.object({
    email,
    role,
    sentViaEmail,
  }),
  z.object({
    role,
    sentViaEmail,
    domains,
  }),
]);

export const resendLinkRequestSchema = z.object({
  email,
  expiredToken,
});

export const deleteSessionSchema = z.object({
  id: sessionId,
});

export const forgotPasswordSchema = z.object({
  email,
  recaptchaToken: recaptchaToken.optional(),
});

export const resendEmailToken = z.object({
  email,
});

export const checkoutSessionSchema = z.object({
  price: priceId,
  quantity: quantity.optional(),
});

export const updateMemberSchema = z.object({
  role,
  memberId,
});

export const acceptInvitationSchema = z.object({
  inviteToken,
});

export const getInvitationSchema = z.object({
  token: inviteToken,
});

export const webhookEndpointSchema = z.object({
  name: name(),
  url,
  eventTypes,
});

export const updateWebhookEndpointSchema = webhookEndpointSchema.extend({
  endpointId,
});

export const getInvitationsSchema = z.object({
  sentViaEmail: sentViaEmailString,
});

export const deleteInvitationSchema = z.object({
  id: invitationId,
});

export const getWebhookSchema = z.object({
  endpointId,
});

export const deleteWebhookSchema = z.object({
  webhookId: endpointId,
});

export const deleteMemberSchema = z.object({
  memberId,
});

export const deleteProjectSchema = z.object({
  id: z.string(),
});

export const updateProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  user_id: z.string().optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamId: z.string().optional(),
  status: z.string().optional()

});

export const projectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  user_id: z.string().optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teamId: z.string().optional(),
  status: z.boolean().optional()
});

// email or slug
export const ssoVerifySchema = z
  .object({
    email: email.optional().or(z.literal('')),
    slug: slug.optional().or(z.literal('')),
  })
  .refine((data) => data.email || data.slug, {
    message: 'At least one of email or slug is required',
  });
export const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  projectId: z.string().optional(),
  stage: z.string().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  assignee: z.string().optional(),
  assignor: z.string().optional(),
  priority: z.string().optional(),
  teamId: z.string().optional(),
  tag: z.string().optional(),
  status: z.string().optional()
});
export const teamMemberSchema = z.object({
  teamId: z.string().optional(),
  userId: z.string().optional(),
  role: z.string().optional(),

});
export const chatGroupSchema = z.object({
  groupName: z.string().min(1, "group name is required"),
  teamId: z.string().optional(),
  user_id: z.string().optional(),
  status: z.boolean().optional()
});
export const channelUserSchema = z.object({
  channelId: z.string().min(1, "Channel name is required"),
  userId: z.string().optional(),
  teamId: z.string().optional(),
});
export const lastReadTime = z.object({
  channelId: z.string().min(1, "Channel name is required"),
  userId: z.string().min(1, "userId name is required"),
  teamId:  z.string().optional(),
  LastReadTime:  z.string().optional(),
});